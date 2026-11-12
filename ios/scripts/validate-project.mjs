import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root,name),'utf8').replace(/^\uFEFF/,'');
const pbx = read('LumaCamera.xcodeproj/project.pbxproj');
const definitions = [...pbx.matchAll(/^([A-F0-9]{24}) = /gm)].map(m=>m[1]);
assert.equal(new Set(definitions).size, definitions.length, 'Duplicate project object identifiers');
for (const ref of pbx.matchAll(/\b[A-F0-9]{24}\b/g)) assert.ok(definitions.includes(ref[0]), `Undefined project object ${ref[0]}`);
for (const entry of pbx.matchAll(/path = "([^"]+)"; sourceTree = "<group>"/g)) {
    assert.ok(fs.existsSync(path.join(root,'LumaCamera',entry[1])), `Missing source/resource: ${entry[1]}`);
}
const library = JSON.parse(read('LumaCamera/Resources/looks.json'));
assert.ok(library.films.length >= 42);
assert.ok(library.cameras.length >= 24);
assert.equal(new Set(library.films.map(f=>f.id)).size, library.films.length);
assert.equal(new Set(library.cameras.map(c=>c.name)).size, library.cameras.length);
for (const film of library.films) {
    for (const key of ['id','name','brand','category','description']) assert.equal(typeof film[key],'string');
    for (const key of ['b','c','s','w','h','g','fade']) assert.ok(Number.isFinite(film[key]),`${film.id}: ${key}`);
    assert.ok(film.b > 0, 'Exposure log must be finite');
}
for (const camera of library.cameras) {
    for (const key of ['name','desc']) assert.equal(typeof camera[key],'string');
    for (const key of ['c','s','w']) assert.ok(Number.isFinite(camera[key]));
}
for (const name of ['portrait','city','mountain']) assert.ok(fs.statSync(path.join(root,`LumaCamera/Resources/${name}.jpg`)).size > 1000);
const icon = JSON.parse(read('LumaCamera/Assets.xcassets/AppIcon.appiconset/Contents.json'));
const png = fs.readFileSync(path.join(root,'LumaCamera/Assets.xcassets/AppIcon.appiconset',icon.images[0].filename));
assert.equal(png.subarray(1,4).toString(),'PNG');
assert.equal(png.readUInt32BE(16),1024);
assert.equal(png.readUInt32BE(20),1024);
console.log(`Validated Xcode references, ${library.films.length} films, ${library.cameras.length} cameras, sample assets and 1024px icon.`);
console.log('Swift compilation, signing, and device testing still require Xcode.');
