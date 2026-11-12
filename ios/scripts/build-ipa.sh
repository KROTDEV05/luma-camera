#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo 'This step needs macOS + Xcode. On Windows use the included GitHub Actions workflow.' >&2
  exit 1
fi
mkdir -p build
xcodebuild -project LumaCamera.xcodeproj -scheme LumaCamera \
  -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' \
  -derivedDataPath build/DerivedData \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
APP='build/DerivedData/Build/Products/Release-iphoneos/LumaCamera.app'
test -d "$APP"
mkdir -p build/package/Payload
ditto "$APP" build/package/Payload/LumaCamera.app
(cd build/package && /usr/bin/zip -qry ../LumaCamera-unsigned.ipa Payload)
echo 'Created ios/build/LumaCamera-unsigned.ipa — sign with AltStore before installing.'
