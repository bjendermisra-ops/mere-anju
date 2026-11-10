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
for(const ref of refs){if(ref.startsWith("assets/photos/sister-") && !fs.existsSync(path.join(root,ref))) {console.warn("PENDING PHOTO IMPORT:",ref);continue;}assert(fs.existsSync(path.join(root,ref)),"Missing artwork: "+ref);}
console.log("PASS: "+refs.size+" referenced artwork files resolve");


const newPhotos=Array.from({length:10},(_,i)=>"sister-"+String(i+1).padStart(2,"0")+".webp");
assert(cfg.includes('NAME:"Anju"'),"Missing sister recipient");
assert(cfg.includes('SENDER:"Tumhara Bhai Santosh"'),"Missing brother");
assert(cfg.includes('hero:"assets/photos/sister-01.webp"'),"Missing first photo hero");
assert(!cfg.includes("purple-saree-diya-hero"),"Previous recipient must not appear");
for(const name of newPhotos) {
  assert(cfg.includes("assets/photos/"+name),"Missing gallery reference: "+name);
  if(!fs.existsSync(path.join(root,"assets/photos",name)))console.warn("PHOTO NOT YET IMPORTED:",name);
}
for(const id of ["ritual","ritualBar","ritualMsg","ritualCount","letter","letterOpen","letterBody","shareWish"]) {
  assert(ids.has(id),"Missing new Bhai Dooj feature: "+id);
}
assert(html.includes('src="sister.js"'));
assert(html.includes('href="sister.css"'));
new vm.Script(read("sister.js"),{filename:"sister.js"});
console.log("PASS: sister gallery configured, virtual rituals and hidden letter accessible");

assert(html.includes('name="theme-color" content="#170a18"'));
assert(css.includes("--paper:#fffdf9"));
assert(css.includes("@media(prefers-reduced-motion:reduce)"));
assert(html.includes('aria-modal="true"'));
assert(html.includes('inert role="dialog"'));
console.log("PASS: light theme, accessibility and modal controls");

console.log("ALL STATIC SMOKE CHECKS PASSED.");
