"use strict";
(() => {
  const steps=[...document.querySelectorAll(".ritual-step")];
  const progress=document.getElementById("ritualBar");
  const message=document.getElementById("ritualMsg");
  const count=document.getElementById("ritualCount");
  const messages=[
    "Tilak complete! Tujhe hamesha izzat aur khushiyan milen, Anju. ❤️",
    "Aarti done! Tere raaste hamesha roshan rahein. 🪔",
    "Mithai delivered (virtually)! Real waali baaki hai. 🍬😂",
    "Gift unlocked: Tera bhai — lifetime warranty, no returns. 🎁"
  ];
  let completed=0;
  function confetti(){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const palette=["#e5ac5d","#d44873","#f9d996","#9f3458"];
    for(let i=0;i<22;i++){
      const el=document.createElement("span");
      el.className="sibling-confetti";
      el.style.cssText="position:fixed;z-index:272;left:"+Math.random()*100+"vw;top:-20px;width:8px;height:15px;border-radius:2px;background:"+palette[i%palette.length]+";pointer-events:none;animation:fallDown "+(1.25+Math.random())+"s ease-in forwards;animation-delay:"+Math.random()*.4+"s";
      document.body.appendChild(el);setTimeout(()=>el.remove(),2600);
    }
  }
  const sheet=document.createElement("style");
  sheet.textContent="@keyframes fallDown{to{transform:translate3d(35px,110vh,0) rotate(900deg);opacity:0}}";
  document.head.appendChild(sheet);
  steps.forEach((button,i)=>button.addEventListener("click",()=>{
    if(button.disabled)return;
    button.classList.add("done");button.disabled=true;button.setAttribute("aria-pressed","true");
    completed++;
    progress.style.width=(completed/steps.length*100)+"%";
    count.textContent=completed+" / "+steps.length+" rituals unlocked";
    message.textContent=messages[i];
    if(navigator.vibrate)navigator.vibrate(32);
    if(completed===steps.length){message.textContent="Bhai Dooj complete! Ab meri asli gift—neeche wali chitthi kholo. 💌";confetti();}
  }));
  const open=document.getElementById("letterOpen"),letter=document.getElementById("letterBody");
  open?.addEventListener("click",()=>{
    const hidden=!letter.hidden;
    letter.hidden=hidden;open.setAttribute("aria-expanded",String(!hidden));
    open.textContent=hidden?"Seal Todkar Chitthi Padho 💌":"Chitthi Band Karo ✉️";
    if(!hidden){confetti();letter.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"center"});}
  });
  document.getElementById("shareWish")?.addEventListener("click",async()=>{
    const status=document.getElementById("shareStatus");
    const data={title:"Anju · Bhai Dooj 2026 ❤️",text:"Anju ke liye bhai ka ek special surprise ❤️",url:location.href.split("#")[0]};
    try{
      if(navigator.share){await navigator.share(data);status.textContent="Share sheet khul gaya ❤️";}
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(data.url);status.textContent="Link copied! Ab bhej do ❤️";}
      else{status.textContent="Is page ka URL copy karke share kar do ❤️";}
    }catch(e){if(e?.name!=="AbortError")status.textContent="Share nahi hua. Link copy karke bhej sakte ho.";}
  });
})();
