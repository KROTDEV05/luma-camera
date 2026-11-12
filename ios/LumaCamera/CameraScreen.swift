import CoreImage
import SwiftUI
import PhotosUI

struct CameraScreen: View {
    @StateObject private var camera = CameraController()
    @Environment(\.scenePhase) private var scenePhase
    @State private var look = RenderSettings()
    @State private var showLooks = false
    @State private var showLastPhoto = false
    @State private var grid = false
    @State private var flash = false
    @State private var timer = 0
    @State private var countdown = 0
    @State private var exposure: Float = 0
    @State private var imported: PhotosPickerItem?
    @State private var shutterTask: Task<Void, Never>?

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 12) {
                HStack {
                    Text("luma").font(.system(size: 30, weight: .bold, design: .serif))
                    Text("FILM CAMERA").font(.system(size: 9, weight: .semibold)).tracking(3).foregroundStyle(.secondary)
                    Spacer()
                    Button { showLooks = true } label: { Image(systemName: "camera.filters") }.accessibilityLabel("เลือกกล้องและฟิล์ม")
                }.padding(.horizontal, 22)

                ZStack {
                    GeometryReader { frame in
                        if let image = camera.preview {
                            Image(uiImage: image).resizable().scaledToFill()
                                .frame(width: frame.size.width, height: frame.size.height).clipped()
                        } else {
                            Color(white: 0.07)
                            VStack(spacing: 16) {
                                Image(systemName: "camera.aperture").font(.system(size: 40))
                                Text(camera.denied ? "อนุญาตกล้องเพื่อเริ่มถ่าย" : "กำลังเปิดกล้อง…")
                                if camera.denied {
                                    Button("เปิด Settings") { if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) } }
                                }
                            }.frame(maxWidth: .infinity, maxHeight: .infinity)
                        }
                        Color.clear.onAppear { camera.setPreviewRatio(frame.size.width / max(1, frame.size.height)) }
                            .onChange(of: frame.size) { size in camera.setPreviewRatio(size.width / max(1, size.height)) }
                    }
                    if grid {
                        GeometryReader { rect in
                            Path { p in
                                for fraction in [CGFloat(1.0 / 3), CGFloat(2.0 / 3)] {
                                    p.move(to: CGPoint(x: rect.size.width * fraction, y: 0))
                                    p.addLine(to: CGPoint(x: rect.size.width * fraction, y: rect.size.height))
                                    p.move(to: CGPoint(x: 0, y: rect.size.height * fraction))
                                    p.addLine(to: CGPoint(x: rect.size.width, y: rect.size.height * fraction))
                                }
                            }.stroke(.white.opacity(0.3), lineWidth: 0.5)
                        }.allowsHitTesting(false)
                    }
                    VStack {
                        Text(look.film.name.uppercased()).font(.system(size: 10, weight: .medium, design: .monospaced)).tracking(2)
                        Spacer()
                        if !camera.status.isEmpty { Text(camera.status).font(.caption2).padding(6).background(.black.opacity(0.5), in: Capsule()) }
                        HStack(spacing: 8) {
                            ForEach(camera.lenses) { lens in
                                Button(lens.name) { camera.selectLens(lens.id) }
                                    .font(.system(size: 13, weight: .semibold))
                                    .padding(10).background(camera.selectedLens == lens.id ? .white : .black.opacity(0.6), in: Capsule())
                                    .foregroundStyle(camera.selectedLens == lens.id ? .black : .white)
                            }
                        }
                    }.padding(18)
                    if countdown > 0 { Text("\(countdown)").font(.system(size: 80, weight: .light)).shadow(radius: 10) }
                }
                .frame(maxHeight: .infinity).clipShape(RoundedRectangle(cornerRadius: 18))
                .padding(.horizontal, 12)

                HStack(spacing: 12) {
                    Image(systemName: "sun.max")
                    Slider(value: $exposure, in: -2...2, step: 0.1).tint(.white)
                        .accessibilityLabel("ชดเชยแสง")
                        .onChange(of: exposure) { camera.exposure($0) }
                    Text(String(format: "%+.1f", exposure)).font(.system(.caption, design: .monospaced)).frame(width: 36)
                }.padding(.horizontal, 28)

                HStack {
                    PhotosPicker(selection: $imported, matching: .images) { Image(systemName: "photo.badge.plus") }.accessibilityLabel("นำเข้ารูป")
                    Spacer()
                    tool("squareshape.split.3x3", active: grid, label: "เส้นตาราง") { grid.toggle() }
                    Spacer()
                    tool(timer == 0 ? "timer" : "timer.circle.fill", active: timer != 0, label: "ตั้งเวลา \(timer) วินาที") { timer = timer == 0 ? 3 : timer == 3 ? 10 : 0 }
                    Spacer()
                    tool(flash ? "bolt.fill" : "bolt.slash", active: flash, label: "แฟลช") { flash.toggle() }.disabled(!camera.flashAvailable)
                    Spacer()
                    tool("arrow.triangle.2.circlepath.camera", label: "สลับกล้อง") { camera.flip() }
                }.font(.system(size: 21)).padding(.horizontal, 30)

                HStack {
                    Button { showLastPhoto = true } label: {
                        Group {
                            if let photo = camera.lastPhoto { Image(uiImage: photo).resizable().scaledToFill() }
                            else { Image(systemName: "photo.on.rectangle").frame(maxWidth: .infinity, maxHeight: .infinity).background(.white.opacity(0.08)) }
                        }.frame(width: 54, height: 54).clipShape(RoundedRectangle(cornerRadius: 12))
                    }.accessibilityLabel("ดูรูปที่ถ่ายล่าสุด").disabled(camera.lastPhoto == nil)
                    Spacer()
                    Button(action: shutter) {
                        ZStack {
                            Circle().stroke(.white, lineWidth: 2).frame(width: 78, height: 78)
                            Circle().fill(.white).frame(width: 68, height: 68)
                            if camera.busy { ProgressView().tint(.black) }
                        }
                    }.accessibilityLabel("ถ่ายภาพ").disabled(!camera.ready || camera.busy || countdown > 0)
                    Spacer()
                    Button { showLooks = true } label: {
                        VStack(spacing: 3) { Image(systemName: "camera.fill").font(.system(size: 30)); Text("กล้อง / ฟิล์ม").font(.system(size: 9)) }
                            .frame(width: 62, height: 54)
                    }.accessibilityLabel("เลือกกล้องและฟิล์ม")
                }.padding(.horizontal, 30).padding(.bottom, geometry.size.height < 650 ? 4 : 16)
            }.padding(.top, 8).background(.black)
        }
        .foregroundStyle(.white)
        .onAppear { camera.update(look); camera.start() }
        .onDisappear { cancelShutter(); camera.stop() }
        .onChange(of: scenePhase) { phase in
            if phase == .active { camera.start() } else { cancelShutter(); camera.stop() }
        }
        .onChange(of: imported) { item in
            Task {
                do {
                    if let data = try await item?.loadTransferable(type: Data.self) { camera.importPhoto(data) }
                } catch { camera.message = "นำเข้าภาพไม่สำเร็จ: \(error.localizedDescription)" }
                imported = nil
            }
        }
        .sheet(isPresented: $showLooks, onDismiss: { camera.update(look) }) {
            LookPicker(settings: $look).onChange(of: look.film.id) { _ in camera.update(look) }
                .onChange(of: look.camera.id) { _ in camera.update(look) }
                .onChange(of: look.intensity) { _ in camera.update(look) }
                .onChange(of: look.original) { _ in camera.update(look) }
        }
        .sheet(isPresented: $showLastPhoto) {
            NavigationStack {
                VStack {
                    if let photo = camera.lastPhoto { Image(uiImage: photo).resizable().scaledToFit() }
                    if let url = camera.lastFile { ShareLink(item: url) { Label("แชร์ / บันทึกรูป", systemImage: "square.and.arrow.up") }.buttonStyle(.borderedProminent).tint(.white).foregroundStyle(.black) }
                }.padding().navigationTitle("รูปของคุณ").navigationBarTitleDisplayMode(.inline)
                    .toolbar { Button("ปิด") { showLastPhoto = false } }
            }.preferredColorScheme(.dark)
        }
        .alert("LUMA", isPresented: Binding(get: { camera.message != nil }, set: { if !$0 { camera.message = nil } })) {
            Button("ตกลง") { camera.message = nil }
        } message: { Text(camera.message ?? "") }
    }

    private func tool(_ symbol: String, active: Bool = false, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { Image(systemName: symbol).foregroundStyle(active ? .yellow : .white) }
            .accessibilityLabel(label).frame(minWidth: 36, minHeight: 44)
    }

    private func cancelShutter() { shutterTask?.cancel(); shutterTask = nil; countdown = 0 }
    private func shutter() {
        guard countdown == 0, !camera.busy else { return }
        let seconds = timer
        shutterTask = Task { @MainActor in
            if seconds > 0 {
                for value in stride(from: seconds, through: 1, by: -1) {
                    countdown = value
                    do { try await Task.sleep(nanoseconds: 1_000_000_000) } catch { countdown = 0; return }
                }
            }
            countdown = 0
            guard !Task.isCancelled else { return }
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            camera.capture(flash: flash)
        }
    }
}

struct LookPicker: View {
    @Binding var settings: RenderSettings
    @Environment(\.dismiss) private var dismiss
    @State private var tab = 0
    @State private var scene = "portrait"
    @State private var sample: UIImage?
    private var sampleKey: String { "\(scene)-\(settings.film.id)-\(settings.camera.id)-\(settings.intensity)-\(settings.original)" }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    if let sample { Image(uiImage: sample).resizable().scaledToFill().frame(height: 230).frame(maxWidth: .infinity).clipped().clipShape(RoundedRectangle(cornerRadius: 16)) }
                    Picker("ตัวอย่างภาพ", selection: $scene) {
                        Text("คน").tag("portrait"); Text("เมือง").tag("city"); Text("ธรรมชาติ").tag("mountain")
                    }.pickerStyle(.segmented)
                    HStack { Text(settings.film.name).font(.headline); Spacer(); Toggle("ต้นฉบับ", isOn: $settings.original).fixedSize() }
                    Text("ตัวอย่างจำลองจากภาพเดียวกันด้วยโทนที่เลือก สีจริงขึ้นอยู่กับแสงและอุปกรณ์").font(.caption).foregroundStyle(.secondary)
                    HStack { Text("ความเข้ม"); Slider(value: $settings.intensity, in: 0...1).tint(.white) }
                    Picker("เลือกประเภท", selection: $tab) { Text("ฟิล์ม \(LookLibrary.shared.films.count)").tag(0); Text("กล้อง \(LookLibrary.shared.cameras.count)").tag(1) }.pickerStyle(.segmented)
                    if tab == 0 {
                        ForEach(LookLibrary.shared.films) { film in
                            Button { settings.film = film } label: {
                                HStack(spacing: 14) {
                                    Image(systemName: film.category == "bw" ? "circle.lefthalf.filled" : "film").font(.title2).frame(width: 36)
                                    VStack(alignment: .leading, spacing: 4) { Text(film.name).font(.headline); Text(film.description.replacingOccurrences(of: "\n", with: " ")).font(.caption).foregroundStyle(.secondary) }
                                    Spacer()
                                    if film.id == settings.film.id { Image(systemName: "checkmark.circle.fill") }
                                }.padding(14).background(.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
                            }.buttonStyle(.plain)
                        }
                    } else {
                        Text("กล้องจำลองเป็นสูตรสี ไม่ได้เปลี่ยนฮาร์ดแวร์หรือเลนส์ของ iPhone").font(.caption).foregroundStyle(.secondary)
                        ForEach(LookLibrary.shared.cameras) { camera in
                            Button { settings.camera = camera } label: {
                                HStack { Image(systemName: "camera"); VStack(alignment: .leading) { Text(camera.name).font(.headline); Text(camera.desc).font(.caption).foregroundStyle(.secondary) }; Spacer(); if camera.id == settings.camera.id { Image(systemName: "checkmark.circle.fill") } }
                                    .padding(14).background(.white.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
                            }.buttonStyle(.plain)
                        }
                    }
                }.padding()
            }.navigationTitle("Camera collection").navigationBarTitleDisplayMode(.inline)
                .toolbar { Button("ใช้โทนนี้") { dismiss() } }
                .task(id: sampleKey) { await renderSample() }
        }.preferredColorScheme(.dark)
    }

    private func renderSample() async {
        let snapshot = settings, sceneName = scene
        let image = await Task.detached(priority: .userInitiated) { () -> UIImage? in
            guard let url = Bundle.main.url(forResource: sceneName, withExtension: "jpg"), let input = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) else { return nil }
            let engine = FilmEngine()
            let scale = min(1, 800 / input.extent.height)
            return engine.uiImage(engine.process(input.transformed(by: CGAffineTransform(scaleX: scale, y: scale)), settings: snapshot))
        }.value
        guard !Task.isCancelled else { return }
        sample = image
    }
}
