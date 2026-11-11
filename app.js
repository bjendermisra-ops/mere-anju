"use strict";
(() => {
  const cfg = window.BHAI_DOOJ_CONFIG;
  if (!cfg || !cfg.DATA || !Array.isArray(cfg.DATA.photos) || !cfg.DATA.photos.length) {
    document.body.insertAdjacentHTML("afterbegin", '<p role="alert">Please restore config.js: Bhai Dooj photo configuration is missing.</p>');
    document.documentElement.classList.remove("lock");
    return;
  }

  const NAME=cfg.NAME, SENDER=cfg.SENDER, DATA=cfg.DATA;
  const DUAS=cfg.DUAS, FLIPS=cfg.FLIPS, ph=DATA.photos, N=ph.length, step=360/N;
  const $=(id)=>document.getElementById(id);
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("hname").textContent="Happy Bhai Dooj, "+NAME;
  $("fin").textContent="Happy Bhai Dooj, "+NAME;
  $("snd").textContent=SENDER;
  $("isub").textContent=NAME+", tere bhai ne kuch dil se banaya hai! ❤️";
  document.title="Shubh Bhai Dooj, "+NAME+" 🪔✨";

  const fallback="assets/polaroid-pink.svg";
  function setPhoto(im,src,caption){
    im.alt=caption;
    im.decoding="async";
    im.onerror=()=>{
      im.onerror=null;
      im.src=fallback;
      im.alt=caption+" — photo link config.js mein replace karein";
    };
    im.src=src || fallback;
  }
  setPhoto($("heroImg"),DATA.hero,NAME+"'s portrait");

  /* Intro light, rangoli and falling petals */
  const intro=$("intro"),rg=$("rg"),NS="http://www.w3.org/2000/svg";
  function mk(t,a,par=rg){
    const e=document.createElementNS(NS,t);
    for(const k of Object.keys(a))e.setAttribute(k,String(a[k]));
    par.append(e);
    return e;
  }
  [144,126,64,36].forEach(r=>mk("circle",{cx:0,cy:0,r,class:"gd"}));
  function petalRing(n,d,cols,off,delay){
    for(let k=0;k<n;k++){
      const g=mk("g",{transform:"rotate("+(k*360/n+off)+")"});
      const q=mk("path",{d,fill:cols[k%cols.length],stroke:"#fff0d4","stroke-width":1.2},g);
      q.setAttribute("class","pt");
      q.style.setProperty("--d",(delay+k*.038)+"s");
    }
  }
  petalRing(16,"M0 -48 C13 -68 13 -102 0 -124 C-13 -102 -13 -68 0 -48Z",["#ee3e83","#ffad46"],0,.14);
  petalRing(16,"M0 -36 C8 -50 8 -72 0 -90 C-8 -72 -8 -50 0 -36Z",["#48b998","#ffce62","#fff5db"],11.25,.58);
  petalRing(8,"M0 -16 C10 -30 10 -48 0 -62 C-10 -48 -10 -30 0 -16Z",["#fff2d6","#f38cac"],22.5,1.05);
  for(let k=0;k<36;k++){
    const a=k*10*Math.PI/180;
    const c=mk("circle",{cx:Math.sin(a)*135,cy:-Math.cos(a)*135,r:3.2,fill:k%2?"#e6b34e":"#e65d8e",class:"dt"});
    c.style.setProperty("--d",(.28+k*.034)+"s");
  }
  mk("circle",{cx:0,cy:0,r:18,fill:"#ffd36a",stroke:"#bc8c2d",class:"dt"}).style.setProperty("--d","1.45s");
  mk("circle",{cx:0,cy:0,r:8,fill:"#e72976",class:"dt"}).style.setProperty("--d","1.5s");

  function decorateToran(){
    const T=$("toran"),n=Math.max(7,Math.round(innerWidth/42));
    T.replaceChildren();
    for(let i=0;i<n;i++){
      const d=document.createElement("div");
      d.className="sd";
      d.style.setProperty("--i",i);
      d.style.setProperty("--h",(5+(i%2)*12)+"px");
      d.innerHTML='<i class="th"></i><b class="mf"></b><b class="lf"></b>';
      T.append(d);
    }
  }
  decorateToran();

  function drawFairyLights(){
    const L=$("lights"),width=innerWidth;
    L.replaceChildren();
    L.setAttribute("viewBox","0 0 "+width+" 72");
    const segs=Math.max(4,Math.round(width/95)),sw=(width+20)/segs;
    let d="M-10 9";
    for(let i=0;i<segs;i++){const x0=-10+i*sw;d+=" Q"+(x0+sw/2)+" 61 "+(x0+sw)+" 9";}
    const path=mk("path",{d,fill:"none",stroke:"#a97833","stroke-width":1.5},L);
    const length=path.getTotalLength(),colors=["#ed3b7f","#f5b739","#4fc19c","#ff9b42","#fff0cc"];
    for(let l=8,k=0;l<length;l+=24,k++){
      const pt=path.getPointAtLength(l),c=colors[k%5];
      mk("circle",{cx:pt.x,cy:pt.y+4,r:10,fill:c,opacity:.25,class:"bh"},L).style.animationDelay=((k%5)*.3)+"s";
      mk("circle",{cx:pt.x,cy:pt.y+4,r:4,fill:c,class:"bc"},L).style.animationDelay=((k%5)*.3)+"s";
    }
  }
  drawFairyLights();

  (function fallingPetals(){
    const P=$("pets"),colors=[["#ffbb63","#f1783d"],["#ffe6ab","#eeb34b"],["#ff87b2","#e02b77"],["#fff6db","#e5adbb"]];
    if(reduce)return;
    for(let i=0;i<23;i++){
      const p=document.createElement("i"),c=colors[i%4],w=8+Math.random()*10;
      p.className="pet";
      p.style.cssText="left:"+Math.random()*100+"%;width:"+w+"px;height:"+(w*1.28)+"px;background:linear-gradient(135deg,"+c.join(",")+");animation-duration:"+(9+Math.random()*8)+"s;animation-delay:"+(-Math.random()*13)+"s;--dx:"+((Math.random()-.5)*90)+"px";
      P.append(p);
    }
  })();

  /* Particle fireworks: scaled canvas, bounded allocation */
  const cv=$("fx"),ctx=cv.getContext("2d");
  let W=innerWidth,H=innerHeight,particles=[],running=false;
  const COLORS=["#ed2c79","#f3b43c","#ffc85a","#ffdfe9","#14b399","#ff8e4e"];
  function resizeCanvas(){
    W=innerWidth;H=innerHeight;
    const dpr=Math.min(devicePixelRatio || 1,2);
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resizeCanvas();
  function burst(x,y,n=48,colors=COLORS){
    if(!ctx)return;
    n=reduce?Math.min(n,28):n;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,s=1+Math.random()*4.5;
      particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:1,
        color:colors[i%colors.length],radius:1.3+Math.random()*2.1});
    }
    if(particles.length>480)particles=particles.slice(-480);
    if(!running){running=true;requestAnimationFrame(tick);}
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=.048;p.vx*=.988;p.life-=.013;
      ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;
    particles=particles.filter(p=>p.life>0);
    if(particles.length)requestAnimationFrame(tick);
    else{running=false;ctx.clearRect(0,0,W,H);}
  }
  function show(){
    if(reduce){burst(W*.5,H*.3,32);return;}
    for(let i=0;i<7;i++){
      setTimeout(()=>burst(W*(.15+Math.random()*.7),H*(.15+Math.random()*.46),46),i*205);
    }
  }

  let introLit=false,entered=false;
  const LN=["Hey Motki! Tera bhai online aa gaya 👋","Duniya ki sabse shaitaan aur pyaari behen ke liye kuch special hai.","Happy Bhai Dooj! Ab surprise khol, no more waiting. ❤️"];
  $("idiya").addEventListener("click",()=>{
    if(introLit)return;
    introLit=true;
    if(navigator.vibrate)navigator.vibrate(38);
    intro.classList.add("lit");
    const r=$("idiya").getBoundingClientRect();
    burst(r.left+r.width/2,r.top+r.height*.27,42,["#f6bb49","#ff9f45","#fff4d4","#ed3b81"]);
    setTimeout(()=>burst(W/2,H*.51,45),900);
    const lines=$("ilines");
    LN.forEach((message,i)=>{
      setTimeout(()=>{
        if(entered)return;
        const p=document.createElement("p");p.textContent=message;lines.append(p);
      },(reduce?250:1050)+i*(reduce?250:850));
    });
    setTimeout(()=>intro.classList.add("ready"),(reduce?250:1050)+LN.length*(reduce?250:850));
  });
  function enter(){
    if(entered)return;
    entered=true;
    intro.classList.add("go");
    window.scrollTo(0,0);
    show();
    setTimeout(()=>{
      document.documentElement.classList.remove("lock");
      document.body.classList.add("in");
    },reduce?0:650);
    setTimeout(()=>{if(intro.isConnected)intro.remove();},reduce?80:1750);
  }
  $("open").addEventListener("click",enter);
  $("skip").addEventListener("click",enter);

  /* Mouse-based hero tilt, never hijack a touch scroll */
  const tilt=$("tilt"),heroStage=$("stage3");
  heroStage.addEventListener("pointermove",e=>{
    if(reduce || e.pointerType==="touch")return;
    const r=heroStage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    tilt.classList.add("live");
    tilt.style.transform="rotateY("+(x*22)+"deg) rotateX("+(-y*18)+"deg)";
  });
  heroStage.addEventListener("pointerleave",()=>{
    tilt.classList.remove("live");tilt.style.transform="";
  });

  /* Terminal typing animation */
  const TERM=[
    [
        "cm",
        "# operation_motkismile / bhai-dooj-2026"
    ],
    [
        "",
        "$ npm run deploy:best-sister"
    ],
    [
        "ok",
        "✔ 10 memories in gallery"
    ],
    [
        "ok",
        "✔ lifelong brother support: activated"
    ],
    [
        "wr",
        "⚠ sibling roast detector: always ON"
    ],
    [
        "",
        "$ git commit -m \"Motki is my forever teammate ❤️\""
    ],
    [
        "ok",
        "✔ blessings and mithai: unlimited"
    ],
    [
        "ok",
        "✔ Deploy successful. Happy Bhai Dooj, Motki!"
    ]
];
  const pre=$("term");let lineIndex=0;
  function typeLine(){
    if(lineIndex>=TERM.length)return;
    const [c,t]=TERM[lineIndex++],span=document.createElement("span");
    if(c)span.className=c;
    pre.append(span,document.createTextNode("\n"));
    if(reduce){span.textContent=t;setTimeout(typeLine,40);return;}
    let k=0;
    (function type(){
      span.textContent=t.slice(0,++k);
      if(k<t.length)setTimeout(type,14);
      else setTimeout(typeLine,225);
    })();
  }
  if("IntersectionObserver" in window){
    new IntersectionObserver((entries,observer)=>{
      if(entries[0].isIntersecting){observer.disconnect();typeLine();}
    },{threshold:.15}).observe(pre);
  }else typeLine();

  /* 3D photo carousel: fit to visible width, clip overflow and distinguish drag vs tap */
  const ring=$("ring"),galleryStage=$("stage"),capEl=$("cap");
  const pans=[];
  ph.forEach((p,i)=>{
    const panel=document.createElement("div");
    panel.className="pan";panel.setAttribute("role","button");panel.setAttribute("tabindex","0");
    panel.setAttribute("aria-label","Open photo "+(i+1)+": "+p.cap);
    const im=new Image();setPhoto(im,p.src,p.cap);im.draggable=false;
    panel.append(im);ring.append(panel);pans.push(panel);
    panel.addEventListener("keydown",e=>{
      if(e.key==="Enter"||e.key===" "){e.preventDefault();openLB(i);}
    });
  });
  let ang=0,vel=.18,drag=false,lx=0,movedDist=0,downPan=null,pointerStart=0;
  let PW=155,PH=210,R=210,visible=true;
  const base=reduce?0:.18;

  function sizeRing(){
    const w=galleryStage.clientWidth || Math.min(innerWidth,460);
    PW=Math.max(104,Math.min(193,w*.39));
    PH=PW*1.35;
    R=(PW/2)/Math.tan(Math.PI/N)+11;
    ring.style.width=PW+"px";ring.style.height=PH+"px";
    ring.style.marginLeft=(-PW/2)+"px";ring.style.marginTop=(-PH/2)+"px";
    pans.forEach((p,i)=>{
      p.style.width=PW+"px";p.style.height=PH+"px";
      p.style.transform="rotateY("+(i*step)+"deg) translateZ("+R+"px)";
    });
  }
  sizeRing();

  galleryStage.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    drag=true;lx=e.clientX;movedDist=0;vel=0;pointerStart=performance.now();
    downPan=e.target.closest(".pan");
    galleryStage.setPointerCapture(e.pointerId);
  });
  galleryStage.addEventListener("pointermove",e=>{
    if(!drag)return;
    const dx=e.clientX-lx;lx=e.clientX;
    movedDist+=Math.abs(dx);
    ang+=dx*.38;vel=Math.max(-5,Math.min(5,dx*.38));
  });
  function finishDrag(e,cancel=false){
    if(!drag)return;
    drag=false;
    if(galleryStage.hasPointerCapture(e.pointerId))galleryStage.releasePointerCapture(e.pointerId);
    if(!cancel && movedDist<8 && performance.now()-pointerStart<600 && downPan){
      const idx=pans.indexOf(downPan);
      if(idx>=0)openLB(idx);
    }
    downPan=null;
  }
  galleryStage.addEventListener("pointerup",e=>finishDrag(e));
  galleryStage.addEventListener("pointercancel",e=>finishDrag(e,true));
  function rotateOne(delta){
    vel=0;
    const snap=Math.round(ang/step)*step;
    const destination=snap+delta*step;
    if(reduce){ang=destination;return;}
    const from=ang,start=performance.now(),dur=370;
    function animate(now){
      if(drag)return;
      const t=Math.min(1,(now-start)/dur),k=1-Math.pow(1-t,3);
      ang=from+(destination-from)*k;
      if(t<1)requestAnimationFrame(animate);
      else vel=base;
    }
    requestAnimationFrame(animate);
  }
  $("gprev").addEventListener("click",()=>rotateOne(1));
  $("gnext").addEventListener("click",()=>rotateOne(-1));
  if("IntersectionObserver" in window){
    const galleryObserver=new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:0});
    galleryObserver.observe(galleryStage);
  }
  function ringLoop(){
    if(!drag&&visible&&document.visibilityState==="visible"&&!$("lb").classList.contains("on")){
      ang+=vel;
      vel+=(base-vel)*.035;
    }
    ring.style.transform="translateZ("+(-R)+"px) rotateY("+ang+"deg)";
    let best=0,bestF=-2;
    pans.forEach((p,i)=>{
      const a=(i*step+ang)*Math.PI/180,f=Math.cos(a);
      p.style.opacity=(.42+.58*(f+1)/2).toFixed(2);
      p.style.filter="brightness("+(.67+.33*(f+1)/2).toFixed(2)+")";
      p.classList.toggle("is-front",f>.89);
      if(f>bestF){bestF=f;best=i;}
    });
    if(capEl.textContent!==ph[best].cap)capEl.textContent=ph[best].cap;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  /* Flip cards */
  FLIPS.forEach((f,i)=>{
    const b=document.createElement("button");
    b.type="button";b.className="flip";b.setAttribute("aria-pressed","false");
    b.setAttribute("aria-label","Flip card "+(i+1)+": "+f[0]);
    b.innerHTML='<div class="fi"><div class="fa"><b></b><small>✦ Tap karke sach dekhein</small></div><div class="fb"></div></div>';
    b.querySelector("b").textContent=f[0];b.querySelector(".fb").textContent=f[1];
    b.addEventListener("click",()=>{
      const on=b.classList.toggle("on");b.setAttribute("aria-pressed",String(on));
    });
    $("flips").append(b);
  });

  /* Heat meter */
  let heat=24;
  const HM=["Oho! Motki mode loading… 😂","Taang-khichai engine started!","Bachpan ki nok-jhok yaad aa gayi!","Bhai vs behen: legendary battle!","Motki jeet gayi? Okay, shayad. 😏","Lifetime drama, lifetime pyaar. ❤️","Achievement unlocked: BEST SIBLING TEAM! 🏆"];
  $("show").addEventListener("click",()=>{
    heat=Math.min(66,heat+7);
    const lvl=Math.round((heat-24)/7);
    $("temp").textContent=heat+"°C";
    $("meter").setAttribute("aria-valuenow",String(heat));
    $("mfill").style.width=(6+(heat-24)/42*94)+"%";
    $("mmsg").textContent=HM[Math.min(lvl,HM.length-1)];
    burst(W*.5,H*.5,42,["#ffab44","#f62f7c","#ffd468"]);
    if(heat>=66)$("show").textContent="Replay sibling chaos 😂";
  });

  /* Paanch diye, paanch duas */
  let lit=0;
  DUAS.forEach((d,i)=>{
    const b=document.createElement("button");
    b.type="button";b.className="diya";b.setAttribute("aria-label","Diya "+(i+1)+" "+d[0]);b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="flame" aria-hidden="true">🔥</span><span class="bowl" aria-hidden="true"></span><small></small>';
    b.querySelector("small").textContent=d[0].split(" ")[0];
    b.addEventListener("click",()=>{
      if(!b.classList.contains("on")){
        b.classList.add("on");b.setAttribute("aria-pressed","true");lit++;
        $("hint").textContent=lit+" / 5 diye roshan ✨";
        const r=b.getBoundingClientRect();
        burst(r.left+r.width/2,r.top,24,["#ffd364","#f3af42","#ffe2aa"]);
      }
      const rev=$("reveal");rev.replaceChildren();
      const h=document.createElement("h3"),p=document.createElement("p");
      h.textContent=d[0]+" ✨";p.textContent=d[1];rev.append(h,p);
      if(lit===DUAS.length){
        $("hint").textContent="Paanchon diye roshan! ✨ Five promises, always yours, Motki.";
        if(!b.dataset.finale){b.dataset.finale="1";show();}
      }
    });
    $("diyas").append(b);
  });

  /* Final celebration */
  const MS=["Ye fireworks teri smile ke naam, Motki! 🎆","Tu irritate bhi kare toh bhi favourite hai. 😂","Official certificate: iconic sister. 🏅","Repeat celebration approved by Tera Bhai. ❤️"];
  let mi=0;
  $("spark").addEventListener("click",()=>{
    show();$("finemsg").textContent=MS[++mi%MS.length];
  });

  /* Photo lightbox with swipe, zoom, thumbnails, arrows and focus restoration */
  const lb=$("lb"),lbt=$("lbt"),lbcap=$("lbcap"),lbn=$("lbn"),lbth=$("lbth"),lbv=$("lbv");
  let cur=0,zoomed=false,savedY=0,returnFocus=null;
  const slides=[],thumbs=[];
  ph.forEach((p,i)=>{
    const s=document.createElement("div");s.className="lbs";
    const im=new Image();setPhoto(im,p.src,p.cap);im.draggable=false;s.append(im);
    lbt.append(s);slides.push(s);
    const t=document.createElement("button");t.type="button";t.setAttribute("aria-label","Photo "+(i+1)+": "+p.cap);
    const thumbnail=new Image();setPhoto(thumbnail,p.src,p.cap);thumbnail.alt="";t.append(thumbnail);
    t.addEventListener("click",()=>go(i));
    lbth.append(t);thumbs.push(t);
  });
  function go(i,animate=true){
    cur=((i%N)+N)%N;
    slides.forEach(s=>s.classList.remove("z"));zoomed=false;
    lbt.style.transition=animate?"transform .48s cubic-bezier(.2,.8,.2,1)":"none";
    lbt.style.transform="translate3d("+(-cur*100)+"%,0,0)";
    lbcap.textContent=ph[cur].cap;lbn.textContent=(cur+1)+" / "+N;
    thumbs.forEach((t,k)=>t.classList.toggle("on",k===cur));
    const t=thumbs[cur];
    lbth.scrollTo({left:Math.max(0,t.offsetLeft-lbth.clientWidth/2+t.offsetWidth/2),behavior:animate?"smooth":"auto"});
  }
  function openLB(i){
    savedY=scrollY;returnFocus=document.activeElement;
    lb.inert=false;lb.classList.add("on");lb.setAttribute("aria-hidden","false");
    document.documentElement.classList.add("lock");
    go(i,false);$("lbx").focus({preventScroll:true});
    burst(W*.5,H*.5,22);
  }
  function closeLB(){
    lb.classList.remove("on");lb.setAttribute("aria-hidden","true");lb.inert=true;
    document.documentElement.classList.remove("lock");
    window.scrollTo({top:savedY,behavior:"auto"});
    if(returnFocus && typeof returnFocus.focus==="function")returnFocus.focus({preventScroll:true});
  }
  $("lbx").addEventListener("click",closeLB);
  $("lbp").addEventListener("click",()=>go(cur-1));
  $("lbnx").addEventListener("click",()=>go(cur+1));
  addEventListener("keydown",e=>{
    if(!lb.classList.contains("on"))return;
    if(e.key==="Escape"){e.preventDefault();closeLB();}
    if(e.key==="ArrowRight"){e.preventDefault();go(cur+1);}
    if(e.key==="ArrowLeft"){e.preventDefault();go(cur-1);}
    if(e.key==="Tab"){
      const focusable=[...lb.querySelectorAll("button")];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  let sx=0,dx=0,sw=false,swipeMoved=false;
  lbv.addEventListener("pointerdown",e=>{
    dx=0;swipeMoved=false;
    if(zoomed)return;
    sw=true;sx=e.clientX;lbt.style.transition="none";
    lbv.setPointerCapture(e.pointerId);
  });
  lbv.addEventListener("pointermove",e=>{
    if(!sw)return;
    dx=e.clientX-sx;
    if(Math.abs(dx)>8)swipeMoved=true;
    lbt.style.transform="translate3d(calc("+(-cur*100)+"% + "+dx+"px),0,0)";
  });
  function endSwipe(){
    if(!sw)return;sw=false;
    if(Math.abs(dx)>52)go(cur+(dx<0?1:-1));else go(cur);
  }
  lbv.addEventListener("pointerup",endSwipe);
  lbv.addEventListener("pointercancel",endSwipe);
  lbv.addEventListener("click",e=>{
    if(swipeMoved)return;
    const s=slides[cur],im=s.querySelector("img"),r=im.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
    if(s.classList.contains("z")){s.classList.remove("z");zoomed=false;}
    else{
      s.style.setProperty("--ox",((e.clientX-r.left)/r.width*100)+"%");
      s.style.setProperty("--oy",((e.clientY-r.top)/r.height*100)+"%");
      s.classList.add("z");zoomed=true;
    }
  });
  go(0,false);

  /* Progress, stardust and responsive geometry */
  function updateProgress(){
    const total=document.documentElement.scrollHeight-innerHeight;
    $("prog").style.width=(total>0?(scrollY/total*100):0)+"%";
  }
  addEventListener("scroll",updateProgress,{passive:true});
  addEventListener("pointerdown",e=>{
    if(!e.target.closest("button,a,.ringwrap,.lb,#intro"))burst(e.clientX,e.clientY,14);
  });
  let lastPointer=0;
  addEventListener("pointermove",e=>{
    const t=performance.now();
    if(reduce||e.pointerType==="touch"||t-lastPointer<45||intro.isConnected)return;
    lastPointer=t;burst(e.clientX,e.clientY,2,["#e9ae3e","#ec3679"]);
  });
  let resizeQueued=false;
  addEventListener("resize",()=>{
    if(resizeQueued)return;resizeQueued=true;
    requestAnimationFrame(()=>{
      resizeQueued=false;resizeCanvas();sizeRing();drawFairyLights();decorateToran();updateProgress();
    });
  },{passive:true});
  updateProgress();
})();
