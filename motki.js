"use strict";
(() => {
  const $=id=>document.getElementById(id);
  const motionOK=!matchMedia("(prefers-reduced-motion: reduce)").matches;
  const set=(id,text)=>{const e=$(id);if(e)e.textContent=text;};
  document.title="Happy Bhai Dooj, Roshani (Motki) 😂❤️ | From Bhai";
  set("hname","Happy Bhai Dooj, Motki 😂");
  set("fin","Tu Meri Favourite Motki Hai ❤️");
  set("isub","Roshani aka MOTKI... tere bhai ne phir se kalesh kiya hai 😂");
  set("snd","Tera Pagal Bhai Santosh");
  set("hint","0 / 5 diye roshan — haan Motki, sab tere liye!");
  const photo=$("heroImg");
  if(photo){photo.alt="Roshani, lovingly called Motki, in a maroon festive outfit with a hand-painted heart background";photo.fetchPriority="high";}
  // Make the photo gallery safe if the real originals have not yet been uploaded.
  const check=new Image();
  check.onerror=()=>{
    if($("photoPending"))return;
    const notice=document.createElement("div");
    notice.id="photoPending";notice.className="photo-pending";notice.setAttribute("role","status");
    notice.textContent="📸 Original photos abhi gallery mein upload hona baaki hain. Surprise ka baaki content ready hai.";
    const g=$("gal");g?.append(notice);
  };
  check.src="assets/photos/sister-01.webp";
  const complaints=[
    ["🍟","Snack Chor","Chupke se snacks gaayab karna tera favourite Olympic sport hai kya?"],
    ["🎭","Drama Queen","‘Main bilkul theek hoon!’ — Motki ka ye dialogue hamesha suspicious hota hai."],
    ["📱","Reply Delay Expert","Message seen karna 0.2 seconds mein. Reply ka ETA: next yug."],
    ["🧸","Teddy Ki Security","Teddy ko itna hug milta hai, bhai ki kya galti hai? Hum bhi lineup mein hain!"],
    ["📸","Photo Studio CEO","Ek selfie se satisfaction? Nahi! Motki ko poora camera roll chahiye."],
    ["👑","Nakhra Department","Bina notice nakhre change karna — ye kaisa premium subscription hai?"]
  ];
  let casesOpened=0;
  const grid=$("complaintGrid");
  if(grid)complaints.forEach(([emoji,title,verdict],i)=>{
    const b=document.createElement("button");b.type="button";b.className="complaint-card";b.setAttribute("aria-pressed","false");
    b.innerHTML='<span class="case-number">CASE 0'+(i+1)+'</span><span class="case-emoji" aria-hidden="true">'+emoji+'</span><strong></strong><small>File kholo ↗</small>';
    b.querySelector("strong").textContent=title;
    b.addEventListener("click",()=>{
      if(b.classList.contains("opened")){set("complaintResult",verdict+" 😂");return;}
      b.classList.add("opened");b.setAttribute("aria-pressed","true");b.querySelector("small").textContent="Evidence accepted ✓";
      casesOpened++;set("complaintResult","⚖️ Verdict: "+verdict+" (Par saza: ek bhai wali hug ❤️)");
      set("complaintCount",casesOpened+" / 6 cases opened");
      if(casesOpened===complaints.length){set("complaintResult","FINAL VERDICT: MOTKI IS GUILTY... of being the best sister! CASE CLOSED. ❤️");celebrate(18);}
    });
    grid.append(b);
  });
  const roasts=[
    "Oye Motki, tere nakhre load hote-hote Wi-Fi bhi pension le le. 😂",
    "Tu kehti hai 'bas 2 minute'—calendar kholna padta hai! ⏳",
    "Tere camera roll ko ek separate hard drive chahiye. 📷",
    "Roshani naam hai, lekin ghar mein sabse zyada roshni tera attitude karta hai! ✨",
    "Tu jeetegi argument? Haan bhai, hum surrender kar dete hain. 🤣",
    "Bhai ko pareshan karna? Motki ne ismein PhD ki hai. 🎓",
    "Jab tu bole 'mujhe kuch nahi chahiye', samajh jao list bahut lambi hai. 🎁",
    "Tere 20 facial expressions mein se 19 mere liye 'pagal' wale hote hain. 😂",
    "Motki ke phone ka camera bhi kehta hai—bas kar behen! 📸",
    "Tujhse ladai karne se achha ek plate golgappe khila doon. 🌶️",
    "Ek hi photo? Impossible! Motki ka final-final-final version toh abhi aayega. 👑",
    "World's Best Troublemaker Award goes to... meri pyaari Motki! 🏆"
  ];
  let roastIndex=0;
  $("roastButton")?.addEventListener("click",()=>{
    set("roastOutput",roasts[roastIndex%roasts.length]);
    roastIndex++;set("roastTally","Bhai ka roast meter: "+roastIndex+" / "+roasts.length+" (unlimited repeat allowed)");
    if(navigator.vibrate)navigator.vibrate(20);
    if(roastIndex%6===0)celebrate(12);
  });
  $("hugButton")?.addEventListener("click",()=>{
    set("roastOutput","Jokes apart, Motki... tu jaise bhi hai, tu meri pyaari behen hai. Khush rehna, main hamesha hoon. 🫂❤️");
    celebrate(24);
  });
  const questions=[
    {q:"Motki ko sabse zyada kaun pareshan kar sakta hai?",o:["Internet wala random banda","Sirf uska certified bhai","Koi nahi"],a:1,yes:"Bilkul! Ye right lifetime mere naam registered hai. 😂"},
    {q:"Motki gussa ho jaye toh bhai ko kya karna chahiye?",o:["Usse ignore","Mithai/snacks leke sorry bol","Aur roast kar"],a:1,yes:"Mithai peace treaty approved! 🍫"},
    {q:"Roshani ko zaroorat pade toh bhai kya karega?",o:["Kal baat karega","Phone silent karega","Seedha uske side khada hoga"],a:2,yes:"Correct! Mazak ke peeche yahi asli promise hai. ❤️"},
    {q:"Bhai Dooj ke baad hamari nok-jhok ka kya hoga?",o:["Khatam","Double! Par pyaar bhi double","Bas ek din chalegi"],a:1,yes:"Lifetime subscription renewed. No cancellation. 😂"}
  ];
  let current=0,points=0,answered=false;
  function renderQuiz(){
    const item=questions[current],list=$("quizOptions");if(!list)return;
    set("quizStep","Question "+(current+1)+" / "+questions.length);
    set("quizPoints",points+" points");
    set("quizQuestion",item.q);
    set("quizFeedback","");
    list.replaceChildren();answered=false;
    const next=$("quizNext");if(next){next.hidden=true;next.textContent=current===questions.length-1?"Result Dekho 🏆":"Next Question →";}
    item.o.forEach((option,i)=>{
      const b=document.createElement("button");b.type="button";b.className="quiz-option";b.textContent=String.fromCharCode(65+i)+". "+option;
      b.addEventListener("click",()=>{
        if(answered)return;answered=true;
        const correct=i===item.a;
        if(correct){points++;set("quizFeedback","✅ "+item.yes);}else set("quizFeedback","😂 Galat! Sahi answer: "+item.o[item.a]+". "+item.yes);
        [...list.children].forEach((c,k)=>{c.disabled=true;c.classList.add(k===item.a?"correct":k===i?"wrong":"inactive");});
        set("quizPoints",points+" points");
        if(next)next.hidden=false;
      });
      list.append(b);
    });
  }
  $("quizNext")?.addEventListener("click",()=>{
    current++;
    if(current>=questions.length){
      set("quizStep","MINI GAME COMPLETE");
      set("quizQuestion",points===4?"Legendary Motki! FULL MARKS 👑":"Tu na bhi jeete toh meri champion hai, Motki! 🏆");
      set("quizFeedback","Result: "+points+" / 4. Ab cake aur mithai bhai ko khila. ❤️");
      $("quizOptions")?.replaceChildren();
      const next=$("quizNext");next.textContent="Phir Se Khelo ↻";next.hidden=false;
      next.onclick=()=>{current=0;points=0;next.onclick=null;renderQuiz();};
      celebrate(26);
    }else renderQuiz();
  });
  renderQuiz();
  let signed=false;
  $("signContract")?.addEventListener("click",()=>{
    if(signed){set("contractResult","Already signed, Motki! Bahane accepted nahi. 😂");return;}
    signed=true;
    set("contractResult","✍️ Signed by MOTKI & BHAI • Agreement valid till ∞ • Extra mithai compulsory ❤️");
    $("signContract").textContent="AGREEMENT SIGNED ✅";
    $("signContract").classList.add("contract-signed");
    celebrate(35);
  });
  let heroTaps=0;
  $("hname")?.addEventListener("click",()=>{
    heroTaps++;
    if(heroTaps===5){heroTaps=0;celebrate(36);const x=$("hname");x.setAttribute("title","SECRET ACHIEVEMENT: MOTKI LEVEL ∞");set("hname","Motki, Secret Level Unlocked! 🏆");setTimeout(()=>set("hname","Happy Bhai Dooj, Motki 😂"),2100);}
  });
  function celebrate(n=20){
    if(!motionOK)return;
    const colors=["#ffdd9d","#f6a7b5","#d34e76","#fdf3d3","#b24b8e"];
    const frag=document.createDocumentFragment();
    for(let i=0;i<n;i++){
      const p=document.createElement("i");p.className="motki-confetti";
      p.style.left=(Math.random()*100)+"vw";p.style.background=colors[i%colors.length];
      p.style.animationDelay=(Math.random()*.35)+"s";
      p.style.setProperty("--spin",(260+Math.random()*720)+"deg");
      frag.append(p);setTimeout(()=>p.remove(),2750);
    }
    document.body.append(frag);
  }
})();
