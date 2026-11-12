import CoreImage
import UIKit
import ImageIO

struct Film: Decodable, Identifiable {
    let id: String
    let name: String
    let brand: String
    let category: String
    let description: String
    let b: Double
    let c: Double
    let s: Double
    let w: Double
    let h: Double
    let g: Double
    let fade: Double
}

struct CameraLook: Decodable, Identifiable {
    var id: String { name }
    let name: String
    let desc: String
    let c: Double
    let s: Double
    let w: Double
}

struct LookLibrary: Decodable {
    let films: [Film]
    let cameras: [CameraLook]
    static let shared: LookLibrary = {
        guard let url = Bundle.main.url(forResource: "looks", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let library = try? JSONDecoder().decode(LookLibrary.self, from: data),
              !library.films.isEmpty, !library.cameras.isEmpty else {
            preconditionFailure("Missing or invalid bundled looks.json")
        }
        return library
    }()
}

struct RenderSettings {
    var film = LookLibrary.shared.films.first(where: { $0.id == "portra160" }) ?? LookLibrary.shared.films[0]
    var camera = LookLibrary.shared.cameras[0]
    var intensity: Double = 0.8
    var original = false
}

/// Each capture queue owns one renderer. Core Image runs its filters on the GPU.
final class FilmEngine {
    let context = CIContext(options: [.cacheIntermediates: false])

    func process(_ source: CIImage, settings: RenderSettings) -> CIImage {
        guard !settings.original, settings.film.id != "clean" else { return source }
        let f = settings.film, c = settings.camera, t = settings.intensity
        func mix(_ value: Double) -> Double { 1 + (value - 1) * t }
        var image = source.applyingFilter("CIExposureAdjust", parameters: ["inputEV": log2(f.b) * t])
        image = image.applyingFilter("CIColorControls", parameters: [
            "inputSaturation": mix(f.s) * mix(c.s),
            "inputContrast": mix(f.c) * mix(c.c), "inputBrightness": 0
        ])
        if f.s > 0 {
            let warmth = (f.w + c.w) * t
            image = image.applyingFilter("CITemperatureAndTint", parameters: [
                "inputNeutral": CIVector(x: 6500, y: 0),
                "inputTargetNeutral": CIVector(x: 6500 + warmth * 28, y: f.h * t * 0.3)
            ])
        }
        // Lift the toe and compress highlights without washing out the whole image.
        let toe = f.fade * t * 0.5
        image = image.applyingFilter("CIToneCurve", parameters: [
            "inputPoint0": CIVector(x: 0, y: toe),
            "inputPoint1": CIVector(x: 0.25, y: 0.24 + toe * 0.5),
            "inputPoint2": CIVector(x: 0.5, y: 0.5),
            "inputPoint3": CIVector(x: 0.75, y: 0.77),
            "inputPoint4": CIVector(x: 1, y: 0.98)
        ])
        if f.g > 0, let noise = CIFilter(name: "CIRandomGenerator")?.outputImage {
            let amount = f.g / 100 * t * 0.11
            let grain = noise.cropped(to: source.extent)
                .applyingFilter("CIColorControls", parameters: ["inputSaturation": 0])
                .applyingFilter("CIColorMatrix", parameters: [
                    "inputRVector": CIVector(x: amount, y: 0, z: 0, w: 0),
                    "inputGVector": CIVector(x: 0, y: amount, z: 0, w: 0),
                    "inputBVector": CIVector(x: 0, y: 0, z: amount, w: 0),
                    "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                    "inputBiasVector": CIVector(x: -amount / 2, y: -amount / 2, z: -amount / 2, w: 1)
                ])
            image = grain.applyingFilter("CIAdditionCompositing", parameters: [kCIInputBackgroundImageKey: image])
        }
        return image.cropped(to: source.extent)
    }

    func uiImage(_ image: CIImage) -> UIImage? {
        guard let cg = context.createCGImage(image, from: image.extent) else { return nil }
        return UIImage(cgImage: cg)
    }

    func jpeg(_ image: CIImage) -> Data? {
        context.jpegRepresentation(of: image, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!, options: [CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String): 0.95])
    }

    func crop(_ image: CIImage, ratio: CGFloat) -> CIImage {
        let rect = image.extent
        let width = min(rect.width, rect.height * ratio)
        let height = min(rect.height, rect.width / ratio)
        return image.cropped(to: CGRect(x: rect.midX - width / 2, y: rect.midY - height / 2, width: width, height: height))
    }
}
