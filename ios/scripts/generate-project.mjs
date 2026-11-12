import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = ['LumaCameraApp.swift', 'FilmEngine.swift', 'CameraController.swift', 'CameraScreen.swift'];
const resources = ['Resources/looks.json', 'Resources/portrait.jpg', 'Resources/city.jpg', 'Resources/mountain.jpg', 'Assets.xcassets'];
const id = n => n.toString(16).toUpperCase().padStart(24,'0');
const project = id(1), target = id(2), group = id(3), productGroup = id(4), appGroup = id(5), product = id(6);
const sourcePhase = id(7), resourcePhase = id(8), frameworkPhase = id(9), projectList = id(10), targetList = id(11);
const files = [...sources, ...resources].map((name, i) => ({name, ref:id(100+i), build:id(200+i), source:i<sources.length}));
const type = name => name.endsWith('.swift') ? 'sourcecode.swift' : name.endsWith('.jpg') ? 'image.jpeg' : name.endsWith('.json') ? 'text.json' : 'folder.assetcatalog';
const list = values => values.map(v=>`${v},`).join('\n');
const settings = (values) => Object.entries(values).map(([k,v])=>`${k} = ${v};`).join('\n');
const baseProject = {CLANG_ENABLE_MODULES:'YES', IPHONEOS_DEPLOYMENT_TARGET:'16.0', SDKROOT:'iphoneos', SWIFT_VERSION:'5.0', CLANG_ENABLE_OBJC_ARC:'YES'};
const baseTarget = {ASSETCATALOG_COMPILER_APPICON_NAME:'AppIcon', CODE_SIGN_STYLE:'Automatic', CURRENT_PROJECT_VERSION:'1', GENERATE_INFOPLIST_FILE:'NO', INFOPLIST_FILE:'LumaCamera/Info.plist', MARKETING_VERSION:'1.0.0', PRODUCT_BUNDLE_IDENTIFIER:'com.luma.filmcamera', PRODUCT_NAME:'"$(TARGET_NAME)"', TARGETED_DEVICE_FAMILY:'1', SWIFT_EMIT_LOC_STRINGS:'YES', LD_RUNPATH_SEARCH_PATHS:'"$(inherited) @executable_path/Frameworks"', SUPPORTS_MACCATALYST:'NO'};
let objects = [];
for (const f of files) {
    objects.push(`${f.ref} = {isa = PBXFileReference; lastKnownFileType = ${type(f.name)}; path = "${f.name}"; sourceTree = "<group>"; };`);
    objects.push(`${f.build} = {isa = PBXBuildFile; fileRef = ${f.ref}; };`);
}
objects.push(`${product} = {isa = PBXFileReference; explicitFileType = wrapper.application; path = LumaCamera.app; sourceTree = BUILT_PRODUCTS_DIR; };`);
objects.push(`${group} = {isa = PBXGroup; children = (${list([appGroup,productGroup])}); sourceTree = "<group>"; };`);
objects.push(`${appGroup} = {isa = PBXGroup; path = LumaCamera; children = (${list(files.map(f=>f.ref))}); sourceTree = "<group>"; };`);
objects.push(`${productGroup} = {isa = PBXGroup; name = Products; children = (${product},); sourceTree = "<group>"; };`);
for (const [phase,isa,entries] of [[sourcePhase,'PBXSourcesBuildPhase',files.filter(f=>f.source)],[resourcePhase,'PBXResourcesBuildPhase',files.filter(f=>!f.source)],[frameworkPhase,'PBXFrameworksBuildPhase',[]]]) {
    objects.push(`${phase} = {isa = ${isa}; buildActionMask = 2147483647; files = (${list(entries.map(f=>f.build))}); runOnlyForDeploymentPostprocessing = 0; };`);
}
objects.push(`${target} = {isa = PBXNativeTarget; buildConfigurationList = ${targetList}; buildPhases = (${list([sourcePhase,frameworkPhase,resourcePhase])}); buildRules = (); dependencies = (); name = LumaCamera; productName = LumaCamera; productReference = ${product}; productType = "com.apple.product-type.application"; };`);
objects.push(`${project} = {isa = PBXProject; attributes = {LastUpgradeCheck = 1600; TargetAttributes = {${target} = {CreatedOnToolsVersion = 16.0; }; }; }; buildConfigurationList = ${projectList}; compatibilityVersion = "Xcode 14.0"; developmentRegion = th; hasScannedForEncodings = 0; knownRegions = (th,en,Base); mainGroup = ${group}; productRefGroup = ${productGroup}; projectDirPath = ""; projectRoot = ""; targets = (${target},); };`);
for (const [configList, base, offset] of [[projectList,baseProject,300],[targetList,baseTarget,400]]) {
    const configs = ['Debug','Release'].map((name,i)=> {
        const configId = id(offset+i);
        const extra = name === 'Debug' ? {SWIFT_OPTIMIZATION_LEVEL:'"-Onone"', SWIFT_ACTIVE_COMPILATION_CONDITIONS:'DEBUG', DEBUG_INFORMATION_FORMAT:'dwarf'} : {SWIFT_OPTIMIZATION_LEVEL:'"-O"', DEBUG_INFORMATION_FORMAT:'"dwarf-with-dsym"'};
        objects.push(`${configId} = {isa = XCBuildConfiguration; buildSettings = {${settings({...base,...extra})}}; name = ${name}; };`);
        return configId;
    });
    objects.push(`${configList} = {isa = XCConfigurationList; buildConfigurations = (${list(configs)}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`);
}
fs.writeFileSync(path.join(root,'LumaCamera.xcodeproj/project.pbxproj'),`// !$*UTF8*$!\n{archiveVersion = 1; classes = {}; objectVersion = 56; objects = {\n${objects.join('\n')}\n}; rootObject = ${project}; }\n`);
fs.writeFileSync(path.join(root,'LumaCamera.xcodeproj/xcshareddata/xcschemes/LumaCamera.xcscheme'),`<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${target}" BuildableName="LumaCamera.app" BlueprintName="LumaCamera" ReferencedContainer="container:LumaCamera.xcodeproj"/></BuildActionEntry></BuildActionEntries></BuildAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${target}" BuildableName="LumaCamera.app" BlueprintName="LumaCamera" ReferencedContainer="container:LumaCamera.xcodeproj"/></BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"/>
<AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>`);
console.log('Generated Xcode project and shared scheme.');
