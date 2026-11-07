import assert from "node:assert/strict";
import path from "node:path";
import {pathToFileURL} from "node:url";
import fs from "node:fs";
import {chromium} from "playwright";

const out=path.resolve("screenshots");
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
let failures=[];
for(const viewport of [{name:"mobile",width:390,height:844},{name:"small",width:320,height:720},{name:"desktop",width:1440,height:900}]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,reducedMotion:"reduce"});
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.route(/^https:\/\/(example\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,r=>r.abort());
 try{
  await page.goto(pathToFileURL(path.resolve("index.html")).href,{waitUntil:"domcontentloaded",timeout:20000});
  assert.equal(await page.locator("#intro").count(),1,"Intro not mounted");
  assert.equal(await page.locator("#sounddock").count(),1,"Audio controls should be mounted");
  assert.equal(await page.evaluate(()=>window.MereAnjuAudio?.getState().unlocked),false,"Audio must wait for a user gesture");
  await page.locator("#idiya").click();
  await page.waitForFunction(()=>window.MereAnjuAudio?.getState().unlocked===true,{timeout:6000});
  assert.equal(await page.evaluate(()=>window.MereAnjuAudio.getState().playing),true,"User tap must unlock the festival audio");
  assert.equal(await page.evaluate(()=>window.MereAnjuAudio.getState().fireworkScheduled),true,"Random fireworks must be scheduled");
  await page.locator("#soundsettings").click();
  assert.equal(await page.locator("#soundpanel").isVisible(),true,"Audio settings should open");
  await page.locator("#soundvolume").evaluate(el=>{el.value="25";el.dispatchEvent(new Event("input",{bubbles:true}));});
  assert.equal(await page.evaluate(()=>Math.round(window.MereAnjuAudio.getState().volume*100)),25,"Volume control must work");
  await page.locator("#soundfireworks").uncheck();
  assert.equal(await page.evaluate(()=>window.MereAnjuAudio.getState().fireworks),false,"Random fireworks switch must disable");
  await page.locator("#soundfireworks").check();
  await page.locator("#soundsettings").click();
  await page.locator("#soundtoggle").click();
  assert.equal(await page.evaluate(()=>window.MereAnjuAudio.getState().enabled),false,"Mute control must stop sound");
  await page.locator("#soundtoggle").click();
  await page.waitForFunction(()=>window.MereAnjuAudio.getState().playing===true,{timeout:5000});

  assert(await page.locator("#intro").evaluate(e=>e.classList.contains("lit")),"Diya must light");
  await page.locator("#open").waitFor({state:"visible",timeout:7000});
  await page.locator("#open").click();
  await page.locator("#intro").waitFor({state:"detached",timeout:5000});

  await page.locator("#news").scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  assert.match(await page.locator("#term").textContent(),/Deploy successful/,"Build log should type when visited");

  const flip=page.locator(".flip").first();
  await flip.click();
  assert(await flip.evaluate(el=>el.classList.contains("on")),"Flip card did not flip");

  const before=await page.locator("#temp").textContent();
  await page.locator("#show").click();
  assert.notEqual(await page.locator("#temp").textContent(),before,"Heat meter not incremented");

  const diyas=page.locator(".diya");
  assert.equal(await diyas.count(),5,"Five diyas must exist");
  for(let i=0;i<5;i++)await diyas.nth(i).click();
  assert.match(await page.locator("#hint").textContent(),/Paanchon diye roshan/i,"Diyas should reveal wishes");

  const beforeMessage=await page.locator("#finemsg").textContent();
  await page.locator("#spark").click();
  assert.notEqual(await page.locator("#finemsg").textContent(),beforeMessage,"Finale interaction did not update");

  await page.locator("#gal").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const front=page.locator(".pan.is-front").first();
  await front.waitFor({state:"visible",timeout:5000});
  await front.click({force:true,timeout:5000});
  await page.locator("#lb.on").waitFor({state:"visible",timeout:5000});
  const current=await page.locator("#lbn").textContent();
  await page.locator("#lbnx").click();
  assert.notEqual(await page.locator("#lbn").textContent(),current,"Next photo must work");
  await page.locator("#lbp").click();
  assert.equal(await page.locator("#lbn").textContent(),current,"Previous photo must work");
  await page.locator("#lbth button").last().click();
  assert.equal(await page.locator("#lbn").textContent(),`${await page.locator("#lbth button").count()} / ${await page.locator("#lbth button").count()}`,"Thumbnail navigation must work");
  await page.locator("#lbx").click();
  assert(await page.locator("#lb").evaluate(el=>!el.classList.contains("on")),"Lightbox must close");

  const overflow=await page.evaluate(()=>({
   inner:innerWidth,document:document.documentElement.scrollWidth,
   stage:document.getElementById("stage").getBoundingClientRect().width
  }));
  assert(overflow.document<=overflow.inner+3,"Horizontal document overflow: "+JSON.stringify(overflow));
  assert.equal(errors.length,0,"Uncaught browser errors: "+errors.join("; "));

  await page.screenshot({path:path.join(out,viewport.name+".png"),fullPage:true,animations:"disabled"});
  console.log("PASS browser "+viewport.name+": intro, flip, heat, diyas, finale, gallery, lightbox, overflow");
 }catch(e){
  failures.push(viewport.name+": "+e.stack);
  await page.screenshot({path:path.join(out,viewport.name+"-failure.png"),fullPage:true}).catch(()=>{});
 }finally{await page.close();}
}
await browser.close();
if(failures.length){console.error(failures.join("\n\n"));process.exit(1);}
console.log("ALL BROWSER SMOKE CHECKS PASSED.");
