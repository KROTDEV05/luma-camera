import SwiftUI

@main
struct LumaCameraApp: App {
    var body: some Scene {
        WindowGroup { CameraScreen().preferredColorScheme(.dark) }
    }
}
