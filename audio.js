/* Mere Anju festival audio engine: licensed Hare Krishna kirtan + original
 * Web Audio fireworks, diya, and gallery effects. The kirtan recording is
 * by A.C. Bhaktivedanta Swami Prabhupada, via Wikimedia Commons, licensed
 * under Creative Commons Attribution-ShareAlike 3.0 Unported.
 * https://commons.wikimedia.org/wiki/File:Hare_K%C5%99%C5%9B%E1%B9%A3%E1%B9%87a_K%C4%ABrtana_and_purport.ogg
 * Audio begins after a genuine user gesture (browser autoplay policy).
 */
"use strict";
(() => {
  const dock=document.getElementById("sounddock");
  if (!dock) return;

  const $=(id)=>document.getElementById(id);
  const toggle=$("soundtoggle"), settings=$("soundsettings"), panel=$("soundpanel");
  const vol=$("soundvolume"), ambient=$("soundambient"), randomFX=$("soundfireworks"), status=$("soundstatus");
  const STORE="mereanju.audio.v1";
  // Official Wikimedia Commons MP3 transcode of the licensed 1966 recording.
  // Keep the original recording on its host. Playback uses only the kirtan
  // portion and loops before the spoken English purport begins.
  const KIRTAN_URL="https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6b/Hare_K%E1%B9%9B%E1%B9%A3%E1%B9%87a_K%C4%ABrtana_and_purport.ogg/Hare_K%E1%B9%9B%E1%B9%A3%E1%B9%87a_K%C4%ABrtana_and_purport.ogg.mp3";
  const KIRTAN_LOOP_AT=15*60;
  const kirtan=new Audio();
  kirtan.preload="none";
  kirtan.loop=true;
  kirtan.playsInline=true;
  let kirtanStatus="idle", kirtanPlayVersion=0, fallbackTimeout=null;
  function kirtanVolume(){return Math.min(1,state.volume*.34);}
  function pauseKirtan(){
    ++kirtanPlayVersion;
    clearTimeout(fallbackTimeout);
    kirtan.pause();
  }
  function setKirtanState(next){
    if(kirtanStatus===next)return;
    kirtanStatus=next;updateUI();
  }
  function beginFallbackMusic(){
    if(!isActive()||!state.ambient||kirtanStatus==="playing")return;
    if(melodyTimer)return;
    setKirtanState("fallback");
    musicBus.gain.setTargetAtTime(.15,ctx.currentTime,.24);
    musicTick();
    melodyTimer=setInterval(musicTick,820);
  }
  function startKirtan(fromGesture=false){
    if(!state.enabled||!state.ambient||document.hidden)return;
    if(!fromGesture&&!isActive())return;
    if(kirtanStatus==="playing"&&!kirtan.paused)return;
    const ver=++kirtanPlayVersion;
    if(!kirtan.src)kirtan.src=KIRTAN_URL;
    kirtan.volume=kirtanVolume();
    setKirtanState("loading");
    clearTimeout(fallbackTimeout);
    fallbackTimeout=setTimeout(()=>{
      if(ver===kirtanPlayVersion&&kirtanStatus!=="playing")beginFallbackMusic();
    },6500);
    const pending=kirtan.play();
    if(pending&&typeof pending.then==="function"){
      pending.then(()=>{
        if(ver!==kirtanPlayVersion)return;
        if(!state.enabled||!state.ambient){kirtan.pause();return;}
        clearTimeout(fallbackTimeout);
        setKirtanState("playing");
        if(melodyTimer){clearInterval(melodyTimer);melodyTimer=null;}
      }).catch(()=>{
        if(ver!==kirtanPlayVersion)return;
        beginFallbackMusic();
      });
    }
  }
  kirtan.addEventListener("timeupdate",()=>{
    if(kirtan.currentTime>=KIRTAN_LOOP_AT)kirtan.currentTime=0;
  });
  kirtan.addEventListener("error",()=>beginFallbackMusic());
  kirtan.addEventListener("playing",()=>{
    if(!state.enabled||!state.ambient)return;
    clearTimeout(fallbackTimeout);
    setKirtanState("playing");
    if(melodyTimer){clearInterval(melodyTimer);melodyTimer=null;}
  });
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(STORE)||"{}")||{}}catch(_){saved={}}
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state={
    enabled:saved.enabled!==false,
    volume:Number.isFinite(Number(saved.volume))?Math.min(1,Math.max(.05,Number(saved.volume))):.4,
    ambient:saved.ambient!==false,
    fireworks:saved.fireworks!==false,
    unlocked:false,
    supported:!!(window.AudioContext||window.webkitAudioContext),
    nextBurstAt:0
  };
  let ctx=null,master=null,fxBus=null,musicBus=null,compressor=null,noiseBuffer=null;
  let melodyTimer=null,fireworkTimer=null,melodyStep=0,lastInteraction=0;
  let lastBursts=[],activeAudio=false;

  function persist(){
    try{localStorage.setItem(STORE,JSON.stringify({
      enabled:state.enabled,volume:state.volume,ambient:state.ambient,fireworks:state.fireworks
    }))}catch(_){}
  }
  const between=(a,b)=>a+Math.random()*(b-a);
  const isActive=()=>state.enabled&&state.unlocked&&ctx&&ctx.state==="running"&&!document.hidden;

  function updateUI(){
    toggle.setAttribute("aria-pressed",String(!!(state.enabled&&state.unlocked)));
    toggle.querySelector(".sound-icon").textContent=state.enabled?"🔊":"🔇";
    const label=state.supported?(state.enabled?(state.unlocked?"Sound ON":"Tap for Sound"):"Sound OFF"):"Audio Unavailable";
    toggle.querySelector(".sound-label").textContent=label;
    toggle.setAttribute("aria-label",label+(state.enabled?", tap to mute":", tap to enable"));
    toggle.disabled=!state.supported;
    vol.value=String(Math.round(state.volume*100));
    ambient.checked=state.ambient;
    randomFX.checked=state.fireworks;
    status.textContent=!state.supported?"Browser mein audio supported nahi hai":
      !state.enabled?"Audio muted":!state.unlocked?"Diya ya Sound button tap karke kirtan shuru karein":
      !state.ambient?"Background kirtan off; festive effects on":
      kirtanStatus==="playing"?"Hare Krishna kirtan playing 🪷":
      kirtanStatus==="fallback"?"Kirtan unavailable; gentle music playing":
      "Hare Krishna kirtan loading…";
    dock.dataset.sound=state.enabled?(state.unlocked?"on":"ready"):"off";
  }

  function connectNode(node,destination){
    node.connect(destination);
    return node;
  }
  function createGraph(){
    if(ctx)return;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass){state.supported=false;updateUI();return;}
    try{
      ctx=new AudioContextClass();
      compressor=ctx.createDynamicsCompressor();
      compressor.threshold.value=-19;compressor.knee.value=16;compressor.ratio.value=5;
      compressor.attack.value=.006;compressor.release.value=.25;
      master=ctx.createGain();
      musicBus=ctx.createGain();
      fxBus=ctx.createGain();
      musicBus.gain.value=.15;
      fxBus.gain.value=.62;
      musicBus.connect(master);fxBus.connect(master);master.connect(compressor);compressor.connect(ctx.destination);
      master.gain.value=state.enabled?state.volume:0;
    }catch(e){
      state.supported=false;ctx=null;updateUI();
    }
  }

  function gainEnvelope(at,duration,volume,destination,attack=.008){
    const gain=connectNode(ctx.createGain(),destination);
    gain.gain.setValueAtTime(.00001,at);
    gain.gain.linearRampToValueAtTime(Math.max(.00002,volume),at+Math.min(attack,duration*.25));
    gain.gain.exponentialRampToValueAtTime(.00001,at+duration);
    return gain;
  }

  function tone(hz,seconds,level,delay=0,type="sine",bus=fxBus,endFrequency){
    if(!isActive())return;
    const at=ctx.currentTime+Math.max(0,delay);
    const oscillator=ctx.createOscillator();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(Math.max(20,hz),at);
    if(endFrequency)oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),at+seconds);
    const gain=gainEnvelope(at,seconds,level,bus);
    oscillator.connect(gain);
    oscillator.start(at);oscillator.stop(at+seconds+.012);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  }

  function makeNoise(){
    if(noiseBuffer)return noiseBuffer;
    const sampleRate=ctx.sampleRate;
    noiseBuffer=ctx.createBuffer(1,Math.ceil(sampleRate*1.45),sampleRate);
    const a=noiseBuffer.getChannelData(0);
    // Slightly colored random noise to approximate paper crackle and fireworks.
    let prev=0;
    for(let i=0;i<a.length;i++){
      const raw=Math.random()*2-1;
      prev=prev*.27+raw*.73;
      a[i]=prev;
    }
    return noiseBuffer;
  }

  function noise(seconds,level,delay=0,frequency=1100,mode="bandpass",q=.7){
    if(!isActive())return;
    const at=ctx.currentTime+Math.max(0,delay);
    const src=ctx.createBufferSource();src.buffer=makeNoise();
    const filter=ctx.createBiquadFilter();filter.type=mode;filter.frequency.value=frequency;filter.Q.value=q;
    const gain=gainEnvelope(at,seconds,level,fxBus,Math.min(.016,seconds*.18));
    src.connect(filter);filter.connect(gain);src.start(at);src.stop(at+seconds+.005);
    src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
  }

  function shimmer(scale=1){
    if(!isActive())return;
    const harmonics=[987.77,1318.51,1567.98,1975.53];
    for(let i=0;i<harmonics.length;i++)
      tone(harmonics[i],.54+i*.10,.072*scale, i*.09,"sine");
  }
  function diyaStrike(){
    if(!isActive())return;
    noise(.16,.18,0,1900,"highpass");
    tone(785,.34,.092,.09,"sine",fxBus,1240);
    tone(1318.5,.9,.06,.22,"sine");
    shimmer(.65);
  }
  function pageReveal(){
    if(!isActive())return;
    noise(.44,.11,0,900,"bandpass",.55);
    [659.25,830.61,987.77,1318.51].forEach((hz,i)=>tone(hz,.75,.065,i*.13));
  }
  function flipSfx(){
    if(!isActive())return;
    noise(.13,.09,0,2100,"highpass");
    tone(660,.10,.035,.035,"sine");
  }
  function gallerySfx(){
    if(!isActive())return;
    noise(.085,.08,0,2500,"highpass");
    tone(830.61,.14,.025,.015);
  }
  function warmBell(index=0){
    if(!isActive())return;
    const note=[783.99,880,987.77,1174.66,1318.51][index%5];
    tone(note,1.25,.10);
    tone(note*2.01,.7,.028,.04);
    tone(note*.5,.8,.04,.0);
  }

  // Each firework consists of a rising rocket, short bass boom, layered
  // high-frequency crack and several asynchronously timed crackle tails.
  function launchFirework(size=1,delay=0){
    if(!isActive())return;
    const launch=.30+between(.04,.27),bang=delay+launch;
    // Rocket rising in pitch, softened at the beginning.
    tone(between(510,740),launch,.042*size,delay,"sine",fxBus,between(1760,2600));
    noise(launch,.067*size,delay,between(900,1500),"highpass");
    tone(75,.37,.25*size,bang,"sine",fxBus,43);
    noise(.16,.32*size,bang,190,"lowpass",.55);
    noise(.25,.25*size,bang+.015,2500,"highpass");
    noise(.72,.12*size,bang+.045,900,"bandpass",.6);
    const crackles=4+Math.floor(Math.random()*5);
    for(let i=0;i<crackles;i++){
      const jitter=between(.13,.9);
      noise(between(.023,.075),between(.07,.14)*size,bang+jitter,between(1600,5000),"highpass");
    }
    // Duck the melody briefly so the boom remains clear without being loud.
    const normalKirtanVolume=kirtanVolume();
    if(kirtanStatus==="playing"){
      kirtan.volume=normalKirtanVolume*.72;
      // Restore background chant after the loudest part of each burst.
      setTimeout(()=>{if(state.enabled&&state.ambient)kirtan.volume=kirtanVolume()},1550);
    }
    const now=ctx.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setTargetAtTime(.03,now+.01,.055);
    musicBus.gain.setTargetAtTime(state.ambient?.15:0,now+delay+1.45,.35);
  }

  function festivalBurst(count=3){
    if(!isActive())return;
    const n=Math.max(1,Math.min(6,count));
    for(let i=0;i<n;i++) launchFirework(i===0 ? .9 : between(.62,1.04),i*.44+between(0,.12));
  }

  const notes=[392,523.25,659.25,783.99,659.25,523.25,440,523.25,
    659.25,880,659.25,523.25,349.23,440,523.25,698.46];
  function musicTick(){
    if(!isActive()||!state.ambient)return;
    const n=melodyStep++%notes.length;
    tone(notes[n],.96,.041,0,"sine",musicBus,notes[n]*.998);
    if(n%4===0){
      const chords=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
      const chord=chords[Math.floor(n/4)%chords.length];
      chord.forEach((hz,i)=>tone(hz,2.25,.025,i*.035,"triangle",musicBus,hz));
    }
  }

  function startLoops(){
    clearInterval(melodyTimer);clearTimeout(fireworkTimer);
    melodyTimer=null;
    if(!isActive())return;
    if(state.ambient){
      // The kirtan replaces the synthesized melody; the melody is fallback.
      musicBus.gain.setTargetAtTime(0,ctx.currentTime,.11);
      startKirtan();
    } else{
      pauseKirtan();
      kirtanStatus="idle";
      musicBus.gain.setTargetAtTime(0,ctx.currentTime,.11);
    }
    scheduleFirework(true);
  }
  function scheduleFirework(first=false){
    clearTimeout(fireworkTimer);
    if(!isActive()||!state.fireworks)return;
    // Natural quiet gaps, with no stacked explosions on rapid clicks.
    const delay=first?between(6500,11000):between(14500,27500);
    state.nextBurstAt=Date.now()+delay;
    fireworkTimer=setTimeout(()=>{
      if(isActive()&&state.fireworks){
        launchFirework(between(.51,.83));
        if(Math.random()<.2)launchFirework(.53,between(.35,.72));
        scheduleFirework(false);
      }
    },delay);
  }
  function stopLoops(){
    clearInterval(melodyTimer);clearTimeout(fireworkTimer);
    melodyTimer=null;fireworkTimer=null;
    pauseKirtan();
  }

  function enableSound(playCue=true){
    if(!state.supported)return;
    state.enabled=true;
    persist();
    createGraph();
    if(!ctx)return;
    // Trigger HTMLAudioElement.play() in the actual tap handler, not only
    // after an async AudioContext promise (important for Safari / WebView).
    if(state.ambient)startKirtan(true);
    ctx.resume().then(()=>{
      if(!state.enabled)return;
      const first=!state.unlocked;
      state.unlocked=true;
      master.gain.setTargetAtTime(state.volume,ctx.currentTime,.075);
      startLoops();
      if(playCue&&first)shimmer(.63);
      updateUI();
    }).catch(()=>{state.unlocked=false;updateUI()});
  }
  function disableSound(){
    state.enabled=false;
    persist();stopLoops();
    if(master&&ctx)master.gain.setTargetAtTime(0,ctx.currentTime,.035);
    updateUI();
  }

  vol.value=String(Math.round(state.volume*100));
  toggle.addEventListener("click",()=>{
    if(!state.supported)return;
    if(state.enabled&&state.unlocked)disableSound();
    else enableSound(true);
  });
  settings.addEventListener("click",()=>{
    panel.hidden=!panel.hidden;
    settings.setAttribute("aria-expanded",String(!panel.hidden));
  });
  vol.addEventListener("input",()=>{
    state.volume=Math.min(1,Math.max(.05,Number(vol.value)/100));
    persist();
    if(master&&ctx&&state.enabled)master.gain.setTargetAtTime(state.volume,ctx.currentTime,.075);
    kirtan.volume=kirtanVolume();
  });
  ambient.addEventListener("change",()=>{
    state.ambient=ambient.checked;persist();
    if(!state.ambient){
      pauseKirtan();kirtanStatus="idle";
      if(melodyTimer){clearInterval(melodyTimer);melodyTimer=null;}
      if(ctx)musicBus.gain.setTargetAtTime(0,ctx.currentTime,.12);
    }else if(isActive())startKirtan(true);
    updateUI();
  });
  randomFX.addEventListener("change",()=>{
    state.fireworks=randomFX.checked;persist();
    if(isActive())scheduleFirework(true);updateUI();
  });

  // Trusted interaction is essential: Chrome, Android WebView and Safari
  // intentionally block sound on initial page load without a gesture.
  function attemptUnlock(e){
    if(e.target.closest("#sounddock")||!state.enabled||state.unlocked)return;
    if(e.type==="keydown"&&!["Enter"," "].includes(e.key))return;
    enableSound(false);
  }
  document.addEventListener("pointerdown",attemptUnlock,true);
  document.addEventListener("keydown",attemptUnlock,true);

  document.addEventListener("click",e=>{
    if(!isActive())return;
    const el=e.target.closest("button,a");
    if(!el||el.closest("#sounddock"))return;
    if(el.id==="idiya"){diyaStrike();return}
    if(el.id==="open"||el.id==="skip"){pageReveal();return}
    if(el.id==="spark"){festivalBurst(5);return}
    if(el.id==="show"){festivalBurst(2);return}
    if(el.classList.contains("diya")){
      const buttons=[...document.querySelectorAll("#diyas .diya")];
      warmBell(Math.max(0,buttons.indexOf(el)));return;
    }
    if(el.classList.contains("flip")){flipSfx();return}
    if(el.id==="gprev"||el.id==="gnext"||el.classList.contains("pan")){gallerySfx();return}
    if(el.closest("#lb")||el.classList.contains("cta")){gallerySfx();return}
  },true);

  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      stopLoops();
      if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{});
    } else if(state.enabled&&state.unlocked&&ctx){
      ctx.resume().then(()=>startLoops()).catch(()=>{state.unlocked=false;updateUI()});
    }
  });
  window.addEventListener("pagehide",()=>{
    stopLoops();
    if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{});
  });
  window.addEventListener("pageshow",e=>{
    if(e.persisted&&state.enabled&&state.unlocked&&ctx){
      ctx.resume().then(startLoops).catch(()=>{state.unlocked=false;updateUI()});
    }
  });
  document.addEventListener("pointerdown",e=>{
    if(panel.hidden||dock.contains(e.target))return;
    panel.hidden=true;settings.setAttribute("aria-expanded","false");
  });

  // Small read-only diagnostics for Playwright browser regression tests.
  Object.defineProperty(window,"MereAnjuAudio",{value:Object.freeze({
    getState:()=>Object.freeze({
      enabled:state.enabled,unlocked:state.unlocked,supported:state.supported,
      playing:isActive(),ambient:state.ambient,fireworks:state.fireworks,
      volume:state.volume,kirtanStatus,kirtanSource:KIRTAN_URL,
      backgroundScheduled:!!melodyTimer,fireworkScheduled:!!fireworkTimer
    })
  }),writable:false});
  updateUI();
})();