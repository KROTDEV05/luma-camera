import CoreImage
import AVFoundation
import Photos
import UIKit
import ImageIO
import Combine

struct CaptureLens: Identifiable {
    let id: String
    let name: String
    let device: AVCaptureDevice
}

final class PhotoDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    let completion: (Data?, Error?) -> Void
    private var data: Data?
    private var processingError: Error?
    init(_ completion: @escaping (Data?, Error?) -> Void) { self.completion = completion }
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        data = photo.fileDataRepresentation()
        processingError = error
    }
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishCaptureFor resolvedSettings: AVCaptureResolvedPhotoSettings, error: Error?) {
        completion(data, error ?? processingError)
    }
}

final class CameraController: NSObject, ObservableObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    @Published var preview: UIImage?
    @Published var lastPhoto: UIImage?
    @Published var lastFile: URL?
    @Published var message: String?
    @Published var status = ""
    @Published var ready = false
    @Published var busy = false
    @Published var denied = false
    @Published var lenses: [CaptureLens] = []
    @Published var selectedLens = ""
    @Published var flashAvailable = false

    private let session = AVCaptureSession()
    private let queue = DispatchQueue(label: "camera.session", qos: .userInitiated)
    private let photoOutput = AVCapturePhotoOutput()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let engine = FilmEngine()
    private var input: AVCaptureDeviceInput?
    private var settings = RenderSettings()
    private var delegates: [Int64: PhotoDelegate] = [:]
    private var lastFrame: CFTimeInterval = 0
    private var configured = false
    private var wantsRunning = false
    private var capturePending = false
    private var position: AVCaptureDevice.Position = .back
    private var previewRatio: CGFloat = 0.75

    func update(_ value: RenderSettings) { queue.async { self.settings = value } }
    func setPreviewRatio(_ ratio: CGFloat) {
        guard ratio.isFinite, ratio > 0 else { return }
        queue.async { self.previewRatio = ratio }
    }

    func start() {
        queue.async { self.wantsRunning = true }
        AVCaptureDevice.requestAccess(for: .video) { allowed in
            DispatchQueue.main.async { self.denied = !allowed }
            guard allowed else { return }
            self.queue.async {
                guard self.wantsRunning else { return }
                do {
                    if !self.configured { try self.configure() }
                    if !self.session.isRunning { self.session.startRunning() }
                    DispatchQueue.main.async { self.ready = self.session.isRunning }
                } catch { self.fail(error.localizedDescription) }
            }
        }
    }

    func stop() {
        queue.async {
            self.wantsRunning = false
            if self.session.isRunning { self.session.stopRunning() }
            DispatchQueue.main.async { self.ready = false }
        }
    }

    private func configure() throws {
        session.beginConfiguration()
        defer { session.commitConfiguration() }
        session.sessionPreset = .photo
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position) else {
            throw cameraError("ไม่พบกล้องบนอุปกรณ์นี้")
        }
        try replaceInput(camera)
        guard session.canAddOutput(photoOutput), session.canAddOutput(videoOutput) else {
            throw cameraError("ไม่สามารถเปิดเอาต์พุตกล้องได้")
        }
        session.addOutput(photoOutput)
        session.addOutput(videoOutput)
        photoOutput.maxPhotoQualityPrioritization = .quality
        videoOutput.alwaysDiscardsLateVideoFrames = true
        videoOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
        videoOutput.setSampleBufferDelegate(self, queue: queue)
        orientConnections()
        configured = true
        publishLenses()
    }

    private func replaceInput(_ device: AVCaptureDevice) throws {
        let replacement = try AVCaptureDeviceInput(device: device)
        let previous = input
        if let previous { session.removeInput(previous) }
        guard session.canAddInput(replacement) else {
            if let previous, session.canAddInput(previous) { session.addInput(previous) }
            throw cameraError("กล้องนี้ยังไม่พร้อมใช้งาน")
        }
        session.addInput(replacement)
        input = replacement
        DispatchQueue.main.async {
            self.selectedLens = device.uniqueID
            self.flashAvailable = device.hasFlash
        }
    }

    private func orientConnections() {
        for output in [videoOutput as AVCaptureOutput, photoOutput as AVCaptureOutput] {
            if let connection = output.connection(with: .video) {
                if connection.isVideoOrientationSupported { connection.videoOrientation = .portrait }
                if connection.isVideoMirroringSupported {
                    connection.automaticallyAdjustsVideoMirroring = false
                    connection.isVideoMirrored = position == .front
                }
            }
        }
    }

    private func publishLenses() {
        let devices = AVCaptureDevice.DiscoverySession(deviceTypes: [.builtInUltraWideCamera, .builtInWideAngleCamera, .builtInTelephotoCamera], mediaType: .video, position: position).devices
        let values = devices.map { device in
            CaptureLens(id: device.uniqueID, name: device.deviceType == .builtInUltraWideCamera ? "0.5×" : device.deviceType == .builtInTelephotoCamera ? "Tele" : "1×", device: device)
        }
        DispatchQueue.main.async { self.lenses = values }
    }

    func selectLens(_ id: String) {
        queue.async {
            guard self.delegates.isEmpty, !self.capturePending,
                  let device = AVCaptureDevice.devices(for: .video).first(where: { $0.uniqueID == id }) else { return }
            self.session.beginConfiguration()
            defer { self.session.commitConfiguration() }
            do { try self.replaceInput(device); self.orientConnections() }
            catch { self.fail(error.localizedDescription) }
        }
    }

    func flip() {
        queue.async {
            guard self.configured, self.delegates.isEmpty, !self.capturePending else { return }
            let next: AVCaptureDevice.Position = self.position == .back ? .front : .back
            guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: next) else { return }
            self.session.beginConfiguration()
            defer { self.session.commitConfiguration() }
            do {
                try self.replaceInput(device)
                self.position = next
                self.orientConnections()
                self.publishLenses()
            } catch { self.fail(error.localizedDescription) }
        }
    }

    func exposure(_ value: Float) {
        queue.async {
            guard let device = self.input?.device else { return }
            do {
                try device.lockForConfiguration()
                device.setExposureTargetBias(min(device.maxExposureTargetBias, max(device.minExposureTargetBias, value)), completionHandler: nil)
                device.unlockForConfiguration()
            } catch { self.fail(error.localizedDescription) }
        }
    }

    func capture(flash: Bool) {
        queue.async {
            guard self.session.isRunning, self.delegates.isEmpty, !self.capturePending else { return }
            self.capturePending = true
            DispatchQueue.main.async { self.busy = true }
            let capture = AVCapturePhotoSettings()
            capture.photoQualityPrioritization = .quality
            if self.input?.device.hasFlash == true {
                capture.flashMode = flash ? .on : .off
            }
            let look = self.settings
            let ratio = self.previewRatio
            let id = capture.uniqueID
            let delegate = PhotoDelegate { [weak self] data, error in
                guard let self else { return }
                self.queue.async {
                    defer {
                        self.delegates[id] = nil
                        self.capturePending = false
                        DispatchQueue.main.async { self.busy = false }
                    }
                    guard let data, error == nil else { self.fail(error?.localizedDescription ?? "ถ่ายภาพไม่สำเร็จ"); return }
                    self.renderAndStore(data, settings: look, ratio: ratio)
                }
            }
            self.delegates[id] = delegate
            self.photoOutput.capturePhoto(with: capture, delegate: delegate)
        }
    }

    func importPhoto(_ data: Data) {
        queue.async {
            guard !self.capturePending else { return }
            DispatchQueue.main.async { self.busy = true }
            self.renderAndStore(data, settings: self.settings)
            DispatchQueue.main.async { self.busy = false }
        }
    }

    private func renderAndStore(_ data: Data, settings: RenderSettings, ratio: CGFloat? = nil) {
        guard let source = CIImage(data: data, options: [.applyOrientationProperty: true]) else { fail("เปิดภาพนี้ไม่ได้"); return }
        let result = engine.process(ratio.map { engine.crop(source, ratio: $0) } ?? source, settings: settings)
        guard let jpeg = engine.jpeg(result) else { fail("ประมวลผลภาพไม่สำเร็จ"); return }
        do {
            let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("LumaPhotos", isDirectory: true)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let url = directory.appendingPathComponent(UUID().uuidString + ".jpg")
            try jpeg.write(to: url, options: .atomic)
            let thumbnail = UIImage(data: jpeg)
            DispatchQueue.main.async { self.lastPhoto = thumbnail; self.lastFile = url }
            saveToPhotos(jpeg)
        } catch { fail("บันทึกลงแอปไม่สำเร็จ: \(error.localizedDescription)") }
    }

    private func saveToPhotos(_ data: Data) {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                self.fail("เก็บภาพในแอปแล้ว หากต้องการลง Photos ให้เปิดสิทธิ์ใน Settings หรือกดแชร์")
                return
            }
            PHPhotoLibrary.shared().performChanges({
                PHAssetCreationRequest.forAsset().addResource(with: .photo, data: data, options: nil)
            }) { success, error in
                if success { DispatchQueue.main.async { self.status = "บันทึกลง Photos แล้ว" } }
                else { self.fail("ภาพยังอยู่ในแอป: \(error?.localizedDescription ?? "บันทึก Photos ไม่สำเร็จ")") }
            }
        }
    }

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        let now = CACurrentMediaTime()
        guard now - lastFrame > 1.0 / 15, let buffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        lastFrame = now
        autoreleasepool {
            var image = engine.crop(CIImage(cvPixelBuffer: buffer), ratio: previewRatio)
            let scale = min(1, 800 / image.extent.height)
            image = image.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
            let preview = engine.uiImage(engine.process(image, settings: settings))
            DispatchQueue.main.async { self.preview = preview }
        }
    }

    private func fail(_ text: String) { DispatchQueue.main.async { self.message = text } }
    private func cameraError(_ text: String) -> NSError { NSError(domain: "LumaCamera", code: 1, userInfo: [NSLocalizedDescriptionKey: text]) }
}
