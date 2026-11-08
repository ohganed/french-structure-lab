/* French Structure Lab v1.0 — shared accessible audio for words and sentences.
 * French fr-FR TTS; contextual Japanese/English text also supported when labelled.
 * No remote audio API, no recordings, no changes to exercise records. */
"use strict";
(function(global){
  const PREF="french-structure-lab:v1:audioRate";
  const ROOTS=["#content","#examContent","#cogMain","#lessonList"];
  const CHOICE=".option,.cog-choice";
  const SOURCES=[
    ".question.fr",".model-sentence",".reading-text.fr",".reading-text[lang='fr']",
    ".unit-preview b",".fsl-course-french",".lesson-btn strong",".sentence-line .token",".token-detail strong",
    ".conjugation strong",".conjugation .pills button",".fsl-immersion-note[lang='fr']",
    ".fsl-immersion-level-hint",".exam-model",".cog-scene p",".cog-question",
    ".cog-node span",".cog-nested",".cog-feedback div",".cog-feedback p",
    ".cog-lesson strong",".cog-hero p",
    "[lang='fr'] p","[lang='en'] p","[lang='ja'] p",
    ".reading-translation",".analysis-translation",
    ".fsl-support [lang='en'] p",".fsl-support [lang='ja'] p",
    ".fsl-support [lang='fr'] p"
  ];
  const SKIP="script,style,noscript,code,pre,textarea,input,select,option,svg,.fsl-audio-toolbar,.fsl-audio-control,.fsl-audio-word-bank,.fsl-audio-word,.fsl-audio-sentence";
  const rxWord=/[\p{L}\p{M}]+(?:[’ʼ'\-][\p{L}\p{M}]+)*/gu;
  let rate=0.88,wordMode=false,current=null,observer=null,scheduled=false;
  let toolbar=null,status=null;
  try{const a=Number(JSON.parse(localStorage.getItem(PREF)||"0.88"));if(a>=0.6&&a<=1.2)rate=a}catch{}
  function lang(){try{return global.FSL_LANG?.get?.()||document.documentElement.lang||"ja"}catch{return "ja"}}
  function ui(ja,en,fr){const m=lang();return m==="fr"?fr:m==="en"?en:ja}
  function notice(t){if(status){status.textContent=t;status.setAttribute("role","status")}}
  function prepare(raw){return String(raw||"").replace(/\u00a0/g," ").replace(/_{2,}/g," … ").replace(/\s+/g," ").replace(/\(\s*[es]\s*\)/g,"").trim()}
  function detect(raw,el){
    const ancestor=el?.closest?.("[lang='fr'],[lang='ja'],[lang='en']");
    if(ancestor && ancestor!==document.documentElement){
      const a=ancestor.getAttribute("lang");
      if(a==="fr")return "fr-FR";if(a==="ja")return "ja-JP";if(a==="en")return "en-US";
    }
    if(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(raw))return "ja-JP";
    if(document.documentElement.lang==="en" && el?.closest?.(".cog-scene,.cog-choice,.cog-feedback"))return "en-US";
    const isExercise=!!el?.closest?.(".question.fr,.model-sentence,.reading-text,.option,.unit-preview,.lesson-btn,.conjugation,.sentence-line,.exam-model,.cog-question,.cog-scene,.cog-choice,.cog-node,.cog-nested");
    if(isExercise||/[\u00c0-\u024f\u0152\u0153’]/u.test(raw))return "fr-FR";
    const m=lang();return m==="en"?"en-US":m==="fr"?"fr-FR":"en-US";
  }
  function pickVoice(locale){
    const synth=global.speechSynthesis;
    let voices=[];
    try{voices=synth?.getVoices?.()||[]}catch{}
    const root=locale.split("-")[0].toLowerCase();
    return voices.find(v=>v.lang?.toLowerCase()===locale.toLowerCase())
      ||voices.find(v=>v.lang?.toLowerCase().startsWith(root+"-"))
      ||voices.find(v=>v.lang?.toLowerCase()===root)
      ||null;
  }
  function play(text,locale,button){
    const input=prepare(text);
    if(!input){notice(ui("再生する文章がありません","No text to play","Aucun texte à lire"));return false}
    if(typeof global.SpeechSynthesisUtterance!=="function"||!global.speechSynthesis){
      notice(ui("この端末では読み上げを利用できません","Speech synthesis is unavailable","La synthèse vocale n’est pas disponible"));return false;
    }
    try{
      const synth=global.speechSynthesis;
      synth.cancel();
      if(current?.button)current.button.classList.remove("fsl-playing");
      const u=new global.SpeechSynthesisUtterance(input);
      const actualLocale=locale||"fr-FR";
      u.lang=actualLocale;u.rate=rate;u.pitch=1;u.volume=1;
      const voice=pickVoice(actualLocale);if(voice)u.voice=voice;
      const token={utterance:u,button:button||null};
      current=token;
      if(button)button.classList.add("fsl-playing");
      notice(ui("音声を準備しています…","Preparing speech…","Préparation de la lecture…"));
      u.onstart=()=>{if(current!==token)return;notice(ui("再生中","Playing","Lecture en cours"))};
      const done=()=>{if(current!==token)return;button?.classList.remove("fsl-playing");current=null;notice(ui("再生が終了しました","Playback finished","Lecture terminée"))};
      u.onend=done;
      u.onerror=ev=>{if(current!==token)return;button?.classList.remove("fsl-playing");current=null;if(ev.error!=="canceled"&&ev.error!=="interrupted")notice(ui("音声を再生できません。端末の音声設定を確認してください","Could not play speech. Check device voices","Impossible de lire. Vérifiez les voix installées"));};
      // Call speak synchronously inside the real tap/click event: required on iOS Safari.
      synth.speak(u);
      return true;
    }catch(err){notice(ui("音声を開始できません","Could not start speech","Impossible de démarrer la lecture"));return false}
  }
  function stop(){
    try{global.speechSynthesis?.cancel?.()}catch{}
    current?.button?.classList.remove("fsl-playing");current=null;
    notice(ui("停止しました","Stopped","Lecture arrêtée"));
  }
  function words(raw){
    const out=[];rxWord.lastIndex=0;let m;
    while((m=rxWord.exec(String(raw)))!==null){if(m[0].length>=1&&m[0].length<=64)out.push(m[0]);if(out.length>180)break}
    return out;
  }
  function makeWordButton(word,locale){
    const b=document.createElement("button");b.type="button";b.className="fsl-audio-word-chip";
    b.textContent=word;b.setAttribute("aria-label",ui("単語を再生: ","Play word: ","Écouter le mot : ")+word);
    b.dataset.fslSpeakWord=word;b.dataset.fslLocale=locale;
    return b;
  }
  function sentenceParts(input){
    const text=String(input).replace(/\s+/g," ").trim();
    // Works for short French reading paragraphs, keeping punctuation with the preceding sentence.
    const result=text.split(/(?<=[.!?…])\s+(?=[«“"A-ZÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ])/u).map(x=>x.trim()).filter(Boolean);
    return result.length?result:[text];
  }
  function isSpeechworthy(t,el){
    if(!t||t.length<2)return false;
    if(!/[\p{L}]/u.test(t))return false;
    if(el?.closest?.(SKIP))return false;
    return true;
  }
  function button(text,cls,label){
    const b=document.createElement("button");b.type="button";b.className="fsl-audio-control "+cls;
    b.textContent=text;b.title=label;b.setAttribute("aria-label",label);return b;
  }
  function audioControls(target,text,locale,{choice=false}={}){
    if(target.dataset.fslAudioDone==="yes")return;
    const value=String(text||"").trim();
    if(!isSpeechworthy(value,target))return;
    target.dataset.fslAudioDone="yes";
    target.dataset.fslAudioSource=value;
    target.dataset.fslAudioLocale=locale;
    const icon=button("🔊","fsl-audio-play",ui("文章を再生","Play sentence","Écouter la phrase"));
    icon.dataset.fslSpeakText=value;icon.dataset.fslLocale=locale;
    const bank=document.createElement("div");bank.className="fsl-audio-word-bank";bank.setAttribute("aria-label",ui("単語の発音","Word pronunciation","Prononciation des mots"));
    for(const w of words(value))bank.appendChild(makeWordButton(w,locale));
    if(choice){
      const wrapper=document.createElement("div");wrapper.className=target.classList.contains("token")?"fsl-audio-token-row":"fsl-audio-choice-row";
      target.parentNode.insertBefore(wrapper,target);wrapper.appendChild(target);
      wrapper.appendChild(icon);wrapper.appendChild(bank);
    }else{
      const wrap=document.createElement("span");wrap.className="fsl-audio-sentence";
      wrap.appendChild(icon);
      target.appendChild(wrap);
      target.insertAdjacentElement("afterend",bank);
    }
  }
  function decorateReading(el){
    if(el.dataset.fslAudioDone==="yes")return;
    const original=el.textContent?.trim();
    if(!isSpeechworthy(original,el))return;
    const locale=detect(original,el), parts=sentenceParts(original);
    el.dataset.fslAudioDone="yes";el.dataset.fslAudioSource=original;el.dataset.fslAudioLocale=locale;
    // Reading text is plain text. Split into visually independent, speakable sentences.
    const frag=document.createDocumentFragment();
    parts.forEach(sentence=>{
      const line=document.createElement("span");line.className="fsl-audio-reading-line";
      const txt=document.createElement("span");txt.className="fsl-audio-reading-text";txt.textContent=sentence;
      const icon=button("🔊","fsl-audio-play",ui("この文を再生","Play this sentence","Écouter cette phrase"));
      icon.dataset.fslSpeakText=sentence;icon.dataset.fslLocale=locale;
      line.appendChild(txt);line.appendChild(icon);
      const bank=document.createElement("span");bank.className="fsl-audio-word-bank";
      words(sentence).forEach(w=>bank.appendChild(makeWordButton(w,locale)));
      line.appendChild(bank);frag.appendChild(line);
    });
    el.textContent="";el.appendChild(frag);
  }
  function decorate(root){
    if(!root||!root.isConnected)return;
    const known=Array.from(root.querySelectorAll(CHOICE));
    for(const choice of known){
      if(choice.dataset.fslAudioDone==="yes")continue;
      const label=choice.classList.contains("option")?(choice.querySelector("span:last-child")?.textContent||choice.textContent):choice.textContent?.replace(/^\s*[A-D1-4][.)]?\s*/, "");
      audioControls(choice,label,detect(label,choice),{choice:true});
    }
    for(const el of Array.from(root.querySelectorAll(".reading-text.fr,.reading-text[lang='fr']"))){decorateReading(el)}
    for(const sel of SOURCES){
      const candidates=Array.from(root.querySelectorAll(sel));
      for(const el of candidates){
        if(el.dataset.fslAudioDone==="yes")continue;
        if(el.closest(".fsl-audio-choice-row")||el.closest(".fsl-audio-sentence")||el.closest(".fsl-audio-reading-line"))continue;
        const parentAudio=el.closest("[data-fsl-audio-done='yes']");
        if(parentAudio&&parentAudio!==el)continue;
        if(el.matches(".reading-text"))continue;
        if(sel.startsWith(".cog-") && document.documentElement.lang!=="fr" &&
          !el.matches(".cog-question,.cog-node span,.cog-nested"))continue;
        if(el.matches(".cog-scene p,.cog-feedback div,.cog-feedback p") && document.documentElement.lang!=="fr")continue;
        const t=el.textContent?.trim();
        if(!isSpeechworthy(t,el))continue;
        const buttonParent=el.closest("button");
        if(buttonParent&&buttonParent!==el){
          if(buttonParent.dataset.fslAudioDone!=="yes")audioControls(buttonParent,t,detect(t,el),{choice:true});
          continue;
        }
        if(/[^\x00-\x7F]/.test(t)&&/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(t) &&
           el.closest(".cog-scene,.cog-feedback,.cog-nested"))continue;
        audioControls(el,t,detect(t,el),{choice:el.tagName==="BUTTON"});
      }
    }
    // In word mode, explicit word chips are shown everywhere; controls remain visible in sentence mode.
    if(toolbar)toolbar.classList.toggle("fsl-audio-word-mode",wordMode);
  }
  function refresh(){
    if(scheduled)return;
    scheduled=true;
    Promise.resolve().then(()=>{
      scheduled=false;
      for(const id of ROOTS)decorate(document.querySelector(id));
    });
  }
  function mount(){
    if(document.getElementById("fslAudioToolbar"))return;
    toolbar=document.createElement("div");toolbar.id="fslAudioToolbar";
    toolbar.className="fsl-audio-toolbar";
    toolbar.innerHTML='<div class="fsl-audio-heading">🎧 <strong data-fsl-title></strong></div>'
     +'<div class="fsl-audio-actions"><button type="button" data-fsl-action="words"></button>'
     +'<button type="button" data-fsl-action="selected"></button><button type="button" data-fsl-action="stop"></button>'
     +'<label class="fsl-audio-speed"><span data-fsl-speed-label></span>'
     +'<select aria-label="Speech rate"><option value="0.7">0.7×</option><option value="0.88">0.88×</option><option value="1">1.0×</option><option value="1.12">1.12×</option></select></label></div>'
     +'<div class="fsl-audio-status" data-fsl-status aria-live="polite"></div>';
    const dest=document.querySelector("#quickInfo")||document.querySelector(".exam-navigation")||document.querySelector(".cognition-shell .cog-hero")||document.querySelector("#content")||document.body;
    dest.insertAdjacentElement("afterend",toolbar);
    status=toolbar.querySelector("[data-fsl-status]");
    toolbar.querySelector("select").value=String([0.7,0.88,1,1.12].includes(rate)?rate:0.88);
    toolbar.querySelector("select").addEventListener("change",e=>{
      const v=Number(e.target.value);
      if(v>=0.6&&v<=1.2){rate=v;try{localStorage.setItem(PREF,JSON.stringify(v))}catch{};notice(ui("読み上げ速度を保存しました","Speech speed saved","Vitesse enregistrée"))}
    });
    toolbar.addEventListener("click",e=>{
      const action=e.target.closest("[data-fsl-action]")?.dataset.fslAction;
      if(!action)return;
      if(action==="stop"){stop();return}
      if(action==="words"){wordMode=!wordMode;document.body.classList.toggle("fsl-audio-word-mode",wordMode);labels();return}
      if(action==="selected"){
        const selected=String(global.getSelection?.()?.toString?.()||"").trim();
        if(!selected){notice(ui("読みたい文章を指で選択してください","Select text first","Sélectionnez d’abord un texte"));return}
        play(selected,detect(selected,null));
      }
    });
    labels();
    if(typeof MutationObserver==="function"){
      observer=new MutationObserver(refresh);
      ROOTS.forEach(id=>{const root=document.querySelector(id);if(root)observer.observe(root,{childList:true,subtree:true})});
    }
    refresh();
  }
  function labels(){
    if(!toolbar)return;
    toolbar.querySelector("[data-fsl-title]").textContent=ui("フランス語音声：文章・単語","Audio: sentences & words","Audio : phrases et mots");
    const wb=toolbar.querySelector("[data-fsl-action='words']");
    wb.textContent=wordMode?ui("単語モード ON","Word mode ON","Mots : activé"):ui("単語をタップして聴く","Tap words to listen","Écouter les mots");
    wb.setAttribute("aria-pressed",String(wordMode));
    toolbar.querySelector("[data-fsl-action='selected']").textContent=ui("選択した文章を再生","Read selected text","Lire le texte sélectionné");
    toolbar.querySelector("[data-fsl-action='stop']").textContent=ui("■ 停止","■ Stop","■ Arrêter");
    toolbar.querySelector("[data-fsl-speed-label]").textContent=ui("速度","Speed","Vitesse");
    if(status&&!status.textContent)notice(ui("🔊 で文章を再生。単語モードでは語を個別に選べます。","Press 🔊 to hear a sentence. Word mode reveals each word.","🔊 lit la phrase. Activez « mots » pour écouter chaque mot."));
  }
  document.addEventListener("click",ev=>{
    const word=ev.target.closest?.("[data-fsl-speak-word]");
    if(word){
      ev.preventDefault();ev.stopImmediatePropagation?.();ev.stopPropagation();
      play(word.dataset.fslSpeakWord,word.dataset.fslLocale||"fr-FR",word);return;
    }
    const sentence=ev.target.closest?.("[data-fsl-speak-text]");
    if(sentence){
      ev.preventDefault();ev.stopImmediatePropagation?.();ev.stopPropagation();
      play(sentence.dataset.fslSpeakText,sentence.dataset.fslLocale||"fr-FR",sentence);return;
    }
  },true);
  document.addEventListener("keydown",ev=>{
    const interactive=ev.target.closest?.("[data-fsl-speak-text],[data-fsl-speak-word]");
    if(interactive&&["Enter"," "].includes(ev.key)){ev.preventDefault();interactive.click()}
  },true);
  document.addEventListener("change",ev=>{
    if(ev.target.matches?.("#languageSelect,#examLang,#cogLang")){Promise.resolve().then(labels)}
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
  global.FSL_AUDIO={play,stop,refresh,enhance:decorate,words,sentenceParts,detect,prepare,getRate:()=>rate,isWordMode:()=>wordMode};
})(window);
