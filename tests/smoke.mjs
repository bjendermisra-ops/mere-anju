import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import vm from "node:vm";

const root=path.resolve(process.cwd());
const read=(f)=>fs.readFileSync(path.join(root,f),"utf8");
const html=read("index.html"),css=read("styles.css"),app=read("app.js"),cfg=read("config.js");
new vm.Script(app,{filename:"app.js"});
new vm.Script(cfg,{filename:"config.js"});
console.log("PASS: JavaScript syntax in app.js and config.js");

const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const called=[...app.matchAll(/\$\("([^"]+)"\)/g)].map(m=>m[1]);
for(const id of called)assert(ids.has(id),"Missing HTML element #"+id);
console.log("PASS: "+called.length+" JavaScript ID accesses resolve");

const essentials=["intro","idiya","rg","open","skip","heroImg","hname","news","term","gal","stage","ring","cap",
 "flips","temp","meter","mfill","show","diyas","reveal","hint","spark","fin","finemsg","snd",
 "lb","lbx","lbnx","lbp","lbv","lbt","lbth","lbcap","prog","fx"];
for(const id of essentials)assert(ids.has(id),"Essential feature element missing: "+id);
console.log("PASS: all original user-visible feature sections are present");

for(const method of ["function enter(","function openLB(","function closeLB(","function go(","function ringLoop(",
 "function show(","function typeLine(","function resizeCanvas(","function drawFairyLights("]){
 assert(app.includes(method),"Missing interactive function: "+method);
}
assert(html.includes('class="photo-ring"'),"Missing separate gallery ring class");
assert(html.includes('class="ring-pulse"'),"Missing separate intro pulse ring");
console.log("PASS: intro/gallery ring class collision fixed");

const directory=path.join(root,"assets"),assets=fs.readdirSync(directory).filter(x=>x.endsWith(".svg"));
assert.equal(assets.length,40,"Expected 40 custom SVG assets");
for(const file of assets){
 const content=read("assets/"+file);
 assert(content.includes("<svg") && content.includes("</svg>"),"SVG markup malformed: "+file);
}
console.log("PASS: 40 custom SVG asset files exist");

const refs=new Set([
 ...[...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(m=>m[1]),
 ...[...css.matchAll(/url\(["']?(assets\/[^"')]+)["']?\)/g)].map(m=>m[1]),
 "assets/polaroid-pink.svg"
]);
for(const ref of refs)assert(fs.existsSync(path.join(root,ref)),"Missing artwork: "+ref);
console.log("PASS: "+refs.size+" referenced artwork files resolve");

const expectedPhotos=[
"1000321222.jpg","1000321221.jpg","1000321230.jpg","1000321229.jpg","1000321234.jpg",
"1000358533.jpg","1000358532.jpg","1000358537.jpg","1000358541.jpg","1000358543.jpg"
];
for(const name of expectedPhotos){
  assert(cfg.includes("assets/photos/"+name),"Original JPG filename missing: "+name);
}
const newPhotos=[
"collage-purple-saree.jpg","green-purple-saree-outdoor.jpg","magenta-saree-indoor.jpg",
"teal-dress-tram.jpg","purple-saree-diya-hero.jpg","red-dress-fairy-lights.jpg",
"mirror-selfie-mint.jpg","golden-fantasy-palace.jpg","ivory-sequin-indoor.jpg","vespa-pink-saree.jpg"
];
for(const name of [...expectedPhotos,...newPhotos]){
  assert(fs.existsSync(path.join(root,"assets/photos",name)),"Photo asset missing: "+name);
  assert(cfg.includes("assets/photos/"+name),"Photo not referenced in config: "+name);
}
assert(cfg.includes('hero:"assets/photos/purple-saree-diya-hero.jpg"'),"New royal Diwali hero missing");
assert(html.includes("hero-stage-royal"),"New royal hero structure missing");
assert(cfg.includes('NAME:"Malik"'));
assert(cfg.includes('SENDER:"Santosh"'));
console.log("PASS: all 20 photo assets, original images, new hero and names preserved");

assert(html.includes('name="theme-color" content="#fffaf6"'));
assert(css.includes("--paper:#fffdf9"));
assert(css.includes("@media(prefers-reduced-motion:reduce)"));
assert(html.includes('aria-modal="true"'));
assert(html.includes('inert role="dialog"'));
console.log("PASS: light theme, accessibility and modal controls");

console.log("ALL STATIC SMOKE CHECKS PASSED.");
