'use strict';
(() => {
  const PREFIX='french-structure-lab:v1:';
  const DATA=window.FSL_EXAM_DATA;
  const $=sel=>document.querySelector(sel);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(key,defaultValue)=>{try{const raw=localStorage.getItem(PREFIX+key);return raw===null?defaultValue:JSON.parse(raw)}catch{return defaultValue}};
  const put=(key,value)=>{try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{flash('保存できません。データをバックアップし、ブラウザの容量を確認してください。');return false}};
  const now=()=>new Date().toISOString();
  const day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const daysAfter=(n)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const validGrade=g=>Object.hasOwn(DATA.grades,g);
  const questions=DATA.questions;
  const GRADE_ORDER=['4','3','j2','2','j1','1'];
  const byId=new Map(questions.map(q=>[q.id,q]));
  const state={lang:FSL_LANG.get(),large:read('largeText',false),grade:read('examGrade','2'),progress:read('examProgress',{}),attempts:read('examAttempts',[]),sessions:read('examSessions',[]),active:read('examActive',null),page:'dashboard',chosen:null,revealed:false,typed:'',selectedTopic:null};
  if(!validGrade(state.grade))state.grade='2';
  const ja=()=>state.lang==='ja';
  const tx=(jp,en,fr)=>FSL_LANG.t(jp,en,fr,state.lang);
  const explain=q=>state.lang==='fr'?`<div class="fsl-immersion-note" lang="fr">${esc(FSL_LANG.tip(q.topic,q.cefr))}</div>${FSL_LANG.support(q.whyJa,q.whyEn)}`:`${explain(q)}`;
  const dateLabel=t=>{const d=new Date(t);return Number.isNaN(+d)?'-':d.toLocaleString(state.lang==='fr'?'fr-FR':ja()?'ja-JP':'en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})};
  function flash(message){const el=$('#examToast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(flash.timer);flash.timer=setTimeout(()=>el.classList.remove('show'),2800)}
  const countGrade=g=>questions.filter(q=>q.grade===g);
  const gradeLog=g=>state.attempts.filter(a=>a.grade===g);
  const correctRate=arr=>arr.length?Math.round(arr.filter(a=>a.correct).length/arr.length*100):null;
  const due=q=>{const p=state.progress[q.id];return !!(p&&p.nextDue<=day())};
  const known=q=>!!state.progress[q.id];
  const recentWrong=q=>state.progress[q.id]?.lastCorrect===false;
  function updateHeader(){
    document.body.classList.toggle('large-type',state.large);
    $('#examTotal').textContent=state.attempts.length;
    FSL_LANG.applySelect('examLang');
    const hero=document.querySelector('.exam-hero');hero.querySelector('h1').innerHTML=tx('文法を理解する。<br>試験で使い分ける。','Understand grammar.<br>Make the right choice.','Comprendre la grammaire.<br>Choisir la forme juste.');hero.querySelector('.hero-copy p').textContent=tx('CEFR A1〜C2はそのままに、仏検4級から1級の筆記対策を別の学習軸として育てます。','Keep A1–C2, and also prepare for Futsuken grades 4 to 1.','Le parcours A1–C2 reste disponible. Préparez aussi les épreuves du DAPF, du niveau 4 au niveau 1.');hero.querySelector('.exam-hero-side span').textContent=tx('仏検モードの解答回数','Exam answers','Réponses à l’examen');hero.querySelector('.exam-hero-side small').textContent=tx('出題は独自作成・公式過去問ではありません','Original exercises, not official papers','Exercices originaux, non officiels');
    document.querySelectorAll('.exam-navigation a').forEach(a=>{a.textContent=a.getAttribute('href').includes('cognition')?tx('◈ 認知と文法','◈ Cognition & grammar','◈ Cognition et grammaire'):tx('← A1〜C2教材へ','← A1–C2 courses','← Parcours A1–C2')});
    document.querySelectorAll('.exam-navigation button').forEach((b,i)=>b.textContent=[['級別演習','Practice by grade','Entraînement par niveau'],['学習記録','Learning records','Journal'],['出題範囲・使い方','Guide','Guide de l’examen']][i][state.lang==='ja'?0:state.lang==='en'?1:2]);
    $('#examFont').textContent=state.large?'A−':'A＋';
    $('#examFont').setAttribute('aria-pressed',String(!!state.large));
    document.documentElement.lang=state.lang;
    document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('current',b.dataset.page===state.page));
  }
  function go(page){state.page=page;render();window.scrollTo({top:0,behavior:'instant'});}
  function gradeSelector(){
    return `<div class="exam-grade-grid">${GRADE_ORDER.map(id=>{
      const g=DATA.grades[id];
      const log=gradeLog(id), done=new Set(log.map(a=>a.questionId)).size;
      return `<button type="button" class="exam-grade ${id===state.grade?'chosen':''}" data-grade="${id}" aria-pressed="${id===state.grade}"><div class="exam-grade-title"><strong>${g.name}</strong><small>${esc(g.cefr)}</small></div><p>${esc(g.summary)}</p><div class="exam-grade-meta">${done}/${countGrade(id).length} ${tx('問に挑戦','items attempted')} · ${correctRate(log)===null?'—':correctRate(log)+'%'}</div></button>`;
    }).join('')}</div>`;
  }
  function statsFor(g){const bank=countGrade(g), log=gradeLog(g), done=new Set(log.map(a=>a.questionId)).size, dueCount=bank.filter(due).length;
    return `<div class="exam-metrics"><div><b>${done}/${bank.length}</b><span>${tx('挑戦した問題','Items attempted')}</span></div><div><b>${correctRate(log)===null?'—':correctRate(log)+'%'}</b><span>${tx('累計の正答率','Overall accuracy')}</span></div><div><b>${dueCount}</b><span>${tx('期限の来た復習','Reviews due')}</span></div></div>`;
  }
  function dashboard(){const g=DATA.grades[state.grade], bank=countGrade(state.grade), topics=[...new Set(bank.map(q=>q.topic))], grades=gradeSelector();
    const writing=bank.filter(q=>q.kind!=='choice').length, objective=bank.filter(q=>q.kind==='choice').length;
    return `<section class="panel"><div class="section-head"><div><p class="kicker">CHOOSE A GRADE</p><h2>${tx('対策する級を選ぶ','Choose an exam grade')}</h2><p class="subtle">${tx('CEFRはそのまま。仏検の級は別に管理します。','Your CEFR selection remains unchanged; exam grade is separate.')}</p></div></div>${grades}</section>
    <section class="panel exam-overview"><div class="section-head"><div><p class="kicker">FUTSUKEN · ${esc(g.name)}</p><h2>${esc(g.name)} ${tx('筆記・文法演習','Grammar and written practice')}</h2><p class="subtle">${esc(g.summary)}</p></div><span class="pill">${esc(g.cefr)} ${tx('目安','reference')}</span></div>${statsFor(state.grade)}<div class="exam-actions"><button type="button" class="primary-btn" data-start="adaptive">${tx('今日の10問を練習','Practice up to 10 questions')}</button><button type="button" class="secondary-btn" data-start="mock">${tx(`本番風・選択式（${Math.min(10,objective)}問）`,`Exam-style choice set (${Math.min(10,objective)})`)}</button><button type="button" class="secondary-btn" data-start="new20">${tx('未学習20問','20 fresh questions')}</button><button type="button" class="secondary-btn" data-start="mock25">${tx('選択式25問・まとめて採点','25 choice items: delayed scoring')}</button><button type="button" class="secondary-btn" data-start="review">${tx('間違い・期限の復習','Review due and errors')}</button>${writing?`<button type="button" class="secondary-btn" data-start="writing">${tx(`記入・書き換え（${writing}問）`,`Written responses (${writing})`)}</button>`:''}</div><p class="exam-mode-descriptions">${tx('通常練習：解答後すぐに文法解説。試験風：選択式をまとめて解き、最後に解答・解説を表示。記述：自動照合または模範解答との自己採点。','Practice: instant explanations. Exam-style: feedback after the set. Writing: exact checking or self-assessment against a model.')}</p><p class="exam-note">${tx('「本番風」は短時間の文法演習です。公式の問題数・配点・時間を再現した模擬試験ではありません。','Exam-style sets are short grammar drills, not replicas of official exam timing or scoring.')}</p><div class="divider"></div><h3>${tx('文法項目から選ぶ','Focus on a grammar topic')}</h3><div class="exam-topic-grid">${topics.map(t=>{const arr=bank.filter(q=>q.topic===t);const bad=arr.filter(q=>recentWrong(q)).length;return `<button class="exam-topic" data-topic="${esc(t)}" type="button"><strong>${esc(t)}</strong><span>${arr.length} ${tx('問','items')}${bad?' · '+bad+' '+tx('弱点','weak'):''} →</span></button>`}).join('')}</div><p class="exam-note">${tx('問題は独自作成です。公式過去問や本番の難度を保証するものではありません。','All questions are original. They do not guarantee official item difficulty.')}</p></section>`;
  }
  function priorities(bank){return bank.slice().sort((a,b)=>{const score=q=>{const p=state.progress[q.id];return !p?4:(due(q)?0:(recentWrong(q)?1:(p.rightStreak<2?2:3)))};return score(a)-score(b)||(state.progress[a.id]?.lastAt||'').localeCompare(state.progress[b.id]?.lastAt||'')});}
  function initiate(mode,topic=null){
    if(state.active&&state.active.index<state.active.ids.length){if(!confirm(tx('進行中の演習を終了して、新しく始めますか？','End the current session and start a new one?')))return;finish(false);}
    let bank=countGrade(state.grade);
    if(topic)bank=bank.filter(q=>q.topic===topic);
    if(mode==='mock'||mode==='mock25')bank=bank.filter(q=>q.kind==='choice');
    if(mode==='new20')bank=bank.filter(q=>!known(q));
    if(mode==='writing')bank=bank.filter(q=>q.kind!=='choice');
    if(mode==='review')bank=bank.filter(q=>due(q)||recentWrong(q));
    if(!bank.length){flash(tx('対象となる問題はありません。','No matching items at this time.'));return}
    const ordered=priorities(bank);
    const limit=mode==='mock25'?25:mode==='new20'?20:10;
    const selected=ordered.slice(0,limit);
    state.active={id:`fut:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,grade:state.grade,mode:topic?'topic':mode==='mock25'?'mock':mode,topic,ids:selected.map(q=>q.id),index:0,startedAt:now(),answers:[],skipped:0};
    put('examActive',state.active);state.chosen=null;state.revealed=false;state.typed='';go('study');
  }
  const current=()=>state.active&&byId.get(state.active.ids[state.active.index]);
  const normalized=text=>String(text||'').normalize('NFC').replace(/[’‘ʼ]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?。！?]+$/g,'').toLocaleLowerCase('fr-FR');
  function logAnswer(q,correct,response,manual=false){
    const entry={id:`exa:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,at:now(),sessionId:state.active?.id||null,questionId:q.id,grade:q.grade,cefr:q.cefr,topic:q.topic,kind:q.kind,response:String(response??'').slice(0,500),correct:!!correct,manual:!!manual};
    state.attempts.push(entry);if(state.attempts.length>7500)state.attempts=state.attempts.slice(-7500);put('examAttempts',state.attempts);
    const old=state.progress[q.id]||{attempts:0,correct:0,rightStreak:0,seenAt:entry.at};
    const streak=correct?(old.rightStreak||0)+1:0;const intervals=[1,3,7,14,30,60];
    state.progress[q.id]={...old,attempts:(old.attempts||0)+1,correct:(old.correct||0)+(correct?1:0),rightStreak:streak,lastCorrect:!!correct,lastAt:entry.at,nextDue:daysAfter(correct?intervals[Math.min(streak-1,intervals.length-1)]:1)};
    put('examProgress',state.progress);
    // Share only the daily study count with CEFR modules. No change to their question or session records.
    const activity=read('activity',{});activity[day()]=(Number(activity[day()])||0)+1;put('activity',activity);
    if(state.active){state.active.answers.push(entry);put('examActive',state.active)}
    return entry;
  }
  function choiceAnswer(index){const q=current();if(!q||q.kind!=='choice'||state.chosen!==null)return;
    const correct=index===q.answer;const entry=logAnswer(q,correct,q.options[index]);state.chosen={entry,index};
    if(state.active.mode==='mock'){advance();return}render();
  }
  function checkInput(){const q=current();if(!q||q.kind!=='input'||state.chosen!==null)return;
    const text=$('#examInput')?.value?.trim()||'';if(!text){flash(tx('答えを入力してください','Enter your answer.'));return}
    const valid=q.accepted.some(s=>normalized(s)===normalized(text));const entry=logAnswer(q,valid,text);
    state.chosen={entry,index:null};state.typed=text;render();
  }
  function revealRewrite(){const q=current();if(!q||q.kind!=='rewrite'||state.revealed)return;state.typed=($('#examInput')?.value||'').slice(0,500);state.revealed=true;render();}
  function selfAssess(correct){const q=current();if(!q||q.kind!=='rewrite'||!state.revealed||state.chosen!==null)return;const entry=logAnswer(q,correct,state.typed,true);state.chosen={entry,index:null};render()}
  function advance(){if(!state.active)return;state.active.index++;put('examActive',state.active);state.chosen=null;state.revealed=false;state.typed='';if(state.active.index>=state.active.ids.length)finish(true);else render()}
  function skip(){if(!state.active)return;state.active.skipped++;advance()}
  function finish(show=true){const a=state.active;if(!a)return;
    if(a.answers.length||a.skipped){const s={id:a.id,grade:a.grade,mode:a.mode,topic:a.topic,startedAt:a.startedAt,endedAt:now(),attempts:a.answers.length,correct:a.answers.filter(x=>x.correct).length,skipped:a.skipped,questionIds:a.ids.slice(),answers:a.answers.map(x=>x.id)};state.sessions.push(s);if(state.sessions.length>400)state.sessions=state.sessions.slice(-400);put('examSessions',state.sessions);state.lastSession=s;}
    state.active=null;put('examActive',null);state.chosen=null;state.revealed=false;state.typed='';if(show){if(a.answers.length||a.skipped)go('result');else{flash(tx('記録する解答がないため終了しました。','No answers to record.'));go('dashboard')}}
  }
  function statusAnswer(q){if(!state.chosen)return'';const right=state.chosen.entry.correct;
    return `<div class="exam-feedback ${right?'':'is-wrong'}"><strong>${right?tx('正解です','Correct'):tx('ここを復習しましょう','Review this form')}</strong><p class="exam-model">${esc(q.model)}</p>${explain(q)}<p class="exam-answer-chip">${esc(q.cefr)} · ${esc(q.topic)}</p></div>`;
  }
  function renderSession(){const a=state.active;if(!a){go('dashboard');return''}const q=current();if(!q){finish(true);return''}const progress=Math.round(100*a.index/a.ids.length),mock=a.mode==='mock';
    const options=q.kind==='choice'?`<div class="options">${q.options.map((x,i)=>{const answered=state.chosen!==null;const isRight=answered&&i===q.answer, isWrong=answered&&i===state.chosen.index&&!state.chosen.entry.correct;return `<button type="button" class="option ${isRight?'correct':isWrong?'incorrect':''}" data-choice="${i}" ${answered?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(x)}</span></button>`}).join('')}</div>`:'';
    const text=q.kind==='input'?`<div class="exam-form"><label for="examInput" class="field-label">${tx('正しい形を入力','Type the correct form')}</label><input class="exam-writing" id="examInput" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="300" value="${esc(state.typed)}" ${state.chosen?'disabled':''}><div class="actions">${state.chosen?'':`<button type="button" class="primary-btn" data-action="check">${tx('解答を確認','Check answer')}</button>`}</div></div>`:'';
    const rewrite=q.kind==='rewrite'?`<div class="exam-form"><label for="examInput" class="field-label">${tx('自分のフランス語で書いてください','Write your own French sentence')}</label><textarea id="examInput" class="exam-writing" rows="3" maxlength="500" spellcheck="false" ${state.revealed?'disabled':''}>${esc(state.typed)}</textarea><div class="actions">${state.revealed?'':`<button type="button" class="primary-btn" data-action="reveal">${tx('模範解答を見る','Reveal model answer')}</button>`}</div></div>${state.revealed?`<div class="exam-feedback"><strong>${tx('模範解答と比較して自己採点','Compare your response with the model')}</strong><p class="exam-model">${esc(q.model)}</p>${explain(q)}<p class="exam-note">${tx('同じ意味の適切な別解も正解です。自動で意味の同一性を判断しません。','Other valid paraphrases can be correct. Semantic equivalence is not graded automatically.')}</p>${state.chosen===null?`<div class="exam-assess"><button type="button" class="secondary-btn" data-self="yes">${tx('意味・文法とも正しい','Acceptable answer')}</button><button type="button" class="ghost-btn" data-self="no">${tx('再練習が必要','Needs more practice')}</button></div>`:`<p class="exam-answer-chip">${state.chosen.entry.correct?tx('自己採点：正解','Self-mark: correct'):tx('自己採点：再練習','Self-mark: review needed')}</p>`}</div>`:''}`:'';
    const answered=state.chosen!==null;
    return `<section class="panel"><div class="section-head"><div><p class="kicker">${DATA.grades[a.grade].name} · ${esc(q.topic)} · ${a.mode==='mock'?'EXAM-STYLE':'PRACTICE'}</p><h2>${tx('仏検・文法筆記','French grammar and usage')}</h2></div><span class="pill">${a.index+1} / ${a.ids.length}</span></div><div class="exam-session-meta"><span>${tx('形式','Mode')}: <strong>${q.kind==='choice'?tx('選択式','Multiple choice'):q.kind==='input'?tx('語形記入','Form entry'):tx('書き換え','Rewriting')}</strong></span><span>CEFR ${esc(q.cefr)}</span><span>${tx('経過','Elapsed')} ${Math.floor((Date.now()-Date.parse(a.startedAt))/60000)} ${tx('分','min')}</span></div><div class="exam-progress"><span style="width:${progress}%"></span></div><div class="exam-form"><p class="question fr">${esc(q.prompt)}</p>${options}${text}${rewrite}${q.kind!=='rewrite'&&answered?statusAnswer(q):''}</div>${mock?`<p class="exam-note">${tx('最後まで解くと正答と解説を一覧表示します。','Answers and explanations appear after the set.')}</p>`:''}<div class="exam-actions">${answered?`<button type="button" class="primary-btn" data-action="next">${a.index===a.ids.length-1?tx('結果を見る','Show results'):tx('次の問題へ','Next item')} →</button>`:''}${!answered&&q.kind!=='rewrite'?`<button type="button" class="ghost-btn" data-action="skip">${tx('スキップ','Skip')}</button>`:''}<button type="button" class="ghost-btn" data-action="finish">${tx('ここで学習を終了','End session')}</button></div></section>`;
  }
  function result(){const s=state.lastSession||state.sessions.at(-1);if(!s)return dashboard();const attempts=state.attempts.filter(a=>a.sessionId===s.id), topics={};attempts.forEach(a=>{const p=topics[a.topic]||(topics[a.topic]={n:0,wrong:0});p.n++;if(!a.correct)p.wrong++;});
    const review=attempts.map(a=>{const q=byId.get(a.questionId);if(!q)return'';return `<details><summary>${a.correct?'✓':'×'} ${esc(q.topic)} · ${esc(q.prompt)}</summary><p class="exam-note">${tx('あなたの解答','Your answer')}: ${esc(a.response||'—')}</p><p class="exam-model">${esc(q.model)}</p>${explain(q)}</details>`}).join('');
    return `<section class="panel"><p class="kicker">SESSION SUMMARY</p><h2>${DATA.grades[s.grade].name} · ${tx('演習の振り返り','Session review')}</h2><div class="exam-metrics"><div><b>${s.attempts}</b><span>${tx('解答','Answered')}</span></div><div><b>${s.correct}</b><span>${tx('正解','Correct')}</span></div><div><b>${s.attempts?Math.round(100*s.correct/s.attempts)+'%':'—'}</b><span>${tx('今回の正答率','Accuracy')}</span></div></div>${Object.entries(topics).length?`<h3>${tx('復習したい文法分野','Topics to revisit')}</h3><div class="exam-weak">${Object.entries(topics).map(([k,v])=>`<div class="exam-weak-card"><strong>${esc(k)}</strong><span> · ${v.wrong}/${v.n} ${tx('回の誤答','incorrect')}</span></div>`).join('')}</div>`:''}<div class="exam-actions"><button type="button" class="primary-btn" data-page="dashboard">${tx('級別演習へ','Back to practice')}</button><button type="button" class="secondary-btn" data-page="records">${tx('学習記録を見る','View learning records')}</button></div></section><section class="panel exam-question-list"><h2>${tx('解答・文法解説','Answers and explanations')}</h2>${review||`<p class="subtle">${tx('解答した問題はありません。','No attempted items.')}</p>`}</section>`;
  }
  function records(){const rows=state.attempts.slice(-25).reverse(), logs=gradeLog(state.grade), counts={}, journeys={};for(const a of logs){const v=counts[a.topic]||(counts[a.topic]={n:0,wrong:0});v.n++;if(!a.correct)v.wrong++}
    for(const a of state.attempts){const arr=journeys[a.questionId]||(journeys[a.questionId]=[]);arr.push(a)}
    const recovered=Object.entries(journeys).filter(([,arr])=>arr.some(x=>!x.correct)&&arr.some((x,i)=>x.correct&&arr.slice(0,i).some(y=>!y.correct)));
    const countDate={};for(const a of state.attempts)countDate[a.at.slice(0,10)]=(countDate[a.at.slice(0,10)]||0)+1;
    const days=Array.from({length:28},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(27-i));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`});
    return `<section class="panel"><p class="kicker">FUTSUKEN · LEARNING LEDGER</p><h2>${tx('仏検の学習記録','Exam preparation ledger')}</h2><p class="subtle">${tx('選択・記入・書き換えの解答を保存。CEFRの教材進度とは区別しています。','Choice, entry and rewrite attempts are tracked separately from CEFR coursework.')}</p><div class="exam-metrics"><div><b>${state.attempts.length}</b><span>${tx('累計解答','All attempts')}</span></div><div><b>${correctRate(state.attempts)===null?'—':correctRate(state.attempts)+'%'}</b><span>${tx('記録上の正答率','Recorded accuracy')}</span></div><div><b>${state.sessions.length}</b><span>${tx('完了した演習','Completed sessions')}</span></div></div><h3>${tx('過去28日の学習','Last 28 days')}</h3><div class="exam-heat">${days.map(d=>`<div title="${d}: ${countDate[d]||0}" class="${countDate[d]>3?'high':countDate[d]?'has':''}">${d.slice(-2)}</div>`).join('')}</div><p class="exam-note">${tx('○・×はこのアプリで解いた練習問題の記録であり、仏検の合格可能性を示すものではありません。','These records are practice attempts, not predicted exam performance.')}</p></section>
    <section class="panel"><h2>${tx('級別の苦手分野','Difficult topics by grade')}</h2><div class="exam-record-nav">${GRADE_ORDER.map(k=>{const g=DATA.grades[k];return `<button type="button" class="pill ${k===state.grade?'green':''}" data-grade="${k}">${g.name}</button>`}).join('')}</div><p class="subtle">${DATA.grades[state.grade].name} · ${logs.length} ${tx('解答','attempts')}</p>${Object.keys(counts).length?`<div class="exam-weak" style="margin-top:12px">${Object.entries(counts).sort((a,b)=>b[1].wrong-a[1].wrong).map(([topic,v])=>`<div class="exam-weak-card"><strong>${esc(topic)}</strong><span> · ${v.wrong}/${v.n} ${tx('誤答','incorrect')}</span><div class="exam-track"><span style="width:${Math.round(100*(v.n-v.wrong)/v.n)}%"></span></div><button type="button" class="small-btn" data-topic="${esc(topic)}">${tx('ここを練習','Focus')}</button></div>`).join('')}</div>`:`<p class="exam-empty">${tx('この級の解答記録はまだありません。','No attempts in this grade yet.')}</p>`}</section>
    <section class="panel"><h2>${tx('誤答から正解への変化','From errors to later correct answers')}</h2><p class="subtle">${recovered.length} ${tx('問で変化が記録されました。','items show an error followed by a correct answer.')}</p>${recovered.length?`<div class="exam-history-list" style="margin-top:13px">${recovered.slice(-10).reverse().map(([id,arr])=>{const q=byId.get(id);return `<div class="exam-history"><div><strong>${esc(q?.model||id)}</strong><div class="exam-recovery">${arr.slice(-8).map(a=>`<span class="exam-journey-dot ${a.correct?'right':''}">${a.correct?'✓':'×'}</span>`).join('')}</div></div></div>`}).join('')}</div>`:`<p class="exam-empty">${tx('間違えた問題をもう一度解いて正解すると、ここに変化が現れます。','Reattempt an incorrect item to see its learning journey.')}</p>`}</section>
    <section class="panel"><h2>${tx('最近の解答履歴','Recent attempts')}</h2><div class="exam-history-list">${rows.map(a=>{const q=byId.get(a.questionId);return `<div class="exam-history"><span class="result ${a.correct?'right':''}">${a.correct?'✓':'×'}</span><div><strong>${DATA.grades[a.grade]?.name||a.grade} · ${esc(a.topic)}</strong><br><small>${esc(dateLabel(a.at))} · ${esc(q?.prompt||a.questionId)}${a.manual?' · '+tx('自己採点','self-marked'):''}</small></div></div>`}).join('')||`<p class="exam-empty">${tx('まだ解答記録がありません。','No answers recorded.')}</p>`}</div><div class="divider"></div><h3>${tx('データの持ち運び','Export and backup')}</h3><div class="exam-actions"><button type="button" class="secondary-btn" data-export="csv">${tx('解答履歴CSV','History CSV')}</button><button type="button" class="secondary-btn" data-export="json">${tx('AI分析用JSON','Detailed JSON')}</button><button type="button" class="secondary-btn" data-export="backup">${tx('仏検の記録をバックアップ','Exam backup')}</button></div><label class="field-label" for="examBackupFile">${tx('仏検バックアップの復元（上書き）','Restore exam backup (overwrite)')}</label><input id="examBackupFile" class="file-input" type="file" accept=".json,application/json"><p class="exam-safety">${tx('A1〜C2画面の「完全バックアップJSON」にも仏検の記録を含めます。iCloud自動同期はありません。','The main A1–C2 full backup also includes exam records. iCloud auto-sync is not implemented.')}</p></section>`;
  }
  function guide(){return `<section class="panel exam-article"><p class="kicker">TWO LEARNING PATHS</p><h2>${tx('CEFRと仏検は別の軸です','CEFR and Futsuken are different paths')}</h2><p>${tx('CEFRは言語運用の到達目標、仏検は試験で求められる文法・語法・記述の知識を学ぶ入口です。公式の対応表でも、両者は「およそ」の関係です。','CEFR describes language use, while Futsuken study focuses on exam grammar, usage and writing. The levels are only approximate correspondences.')}</p><div class="exam-grade-grid">${GRADE_ORDER.map(k=>{const g=DATA.grades[k];return `<div class="exam-grade"><div class="exam-grade-title"><strong>${g.name}</strong><small>${esc(g.cefr)}</small></div><p>${esc(g.summary)}</p></div>`}).join('')}</div><div class="divider"></div><h3>${tx('使い方','How to study')}</h3><ol><li>${tx('まず級を選び、「今日の10問」で答えてから解説を読みます。','Choose a grade, answer a short set and review the explanations.')}</li><li>${tx('誤答は翌日以降の復習候補になります。正解が続くと復習間隔が伸びます。','Wrong answers become due again; consistent correct answers lengthen review intervals.')}</li><li>${tx('上位級では記入問題と書き換えを必ず練習してください。書き換えは妥当な別解を自己採点します。','Upper-grade practice includes form entry and rewriting; self-assess valid alternatives.')}</li><li>${tx('「学習記録」で分野別の誤答と解答の変化を確認します。','Use the ledger to identify weak topics and improvements.')}</li></ol><p class="exam-note">${tx('この問題集は各級200問、合計1,200問の独自練習教材です。公式過去問ではなく、全問の専門家校閲や合格判定を保証するものではありません。','This bank contains 200 original items per grade (1,200 total). It is not an official past-paper collection, individually expert-certified, or a pass predictor.')}</p><div class="divider"></div><h3>${tx('公式情報','Official sources')}</h3><p><a href="${DATA.officialLinks.overview}" target="_blank" rel="noopener noreferrer">${tx('APEF：試験内容・試験形式','APEF: examination formats')}</a></p><p><a href="${DATA.officialLinks.examples}" target="_blank" rel="noopener noreferrer">${tx('APEF：過去問題サンプル','APEF: official sample papers')}</a></p><p>${tx('公式資料を見て問題形式・試験時間・出題範囲の詳細を確認してください。','Consult official information for current formats, timing and requirements.')}</p></section>`}
  function render(){updateHeader();let html='';if(state.page==='study')html=renderSession();else if(state.page==='result')html=result();else if(state.page==='records')html=records();else if(state.page==='guide')html=guide();else html=dashboard();$('#examContent').innerHTML=html;}
  function outFile(name,content,mime){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  function output(kind){if(kind==='csv'){const rows=[['日時','級','問題ID','分野','形式','正解','自己採点','解答']];state.attempts.forEach(a=>rows.push([a.at,DATA.grades[a.grade]?.name,a.questionId,a.topic,a.kind,a.correct?'1':'0',a.manual?'1':'0',a.response]));outFile('fsl-futsuken-history.csv','\ufeff'+rows.map(r=>r.map(csv).join(',')).join('\r\n'),'text/csv;charset=utf-8');return}
    if(kind==='backup'){outFile('fsl-futsuken-backup.json',JSON.stringify({format:'fsl-exam-backup',version:'1.0',exportedAt:now(),examProgress:state.progress,examAttempts:state.attempts,examSessions:state.sessions,examGrade:state.grade},null,2),'application/json');return}
    const summary=GRADE_ORDER.map(g=>({grade:g,attempts:gradeLog(g).length,accuracy:correctRate(gradeLog(g)),questionCount:countGrade(g).length}));
    outFile('fsl-futsuken-ai-analysis.json',JSON.stringify({format:'fsl-exam-ai-report',version:'1.0',exportedAt:now(),note:'Locally recorded practice attempts, not an official grade or CEFR proficiency estimate.',summary,progress:state.progress,attempts:state.attempts,sessions:state.sessions,questions:questions.map(q=>({id:q.id,grade:q.grade,cefr:q.cefr,kind:q.kind,topic:q.topic,prompt:q.prompt,model:q.model,explanationJa:q.whyJa,explanationEn:q.whyEn}))},null,2),'application/json');
  }
  async function restore(file){if(file.size>3000000){flash('3MB以下のバックアップを指定してください。');return}
    let data;try{data=JSON.parse(await file.text())}catch{flash('JSONを読み取れませんでした。');return}
    if(!data||data.format!=='fsl-exam-backup'||!Array.isArray(data.examAttempts)||!Array.isArray(data.examSessions)||!data.examProgress||typeof data.examProgress!=='object'||Array.isArray(data.examProgress)){flash('仏検のバックアップ形式ではありません。');return}
    if(!confirm(tx('既存の仏検学習記録を上書きします。現在の記録をバックアップしましたか？','Overwrite exam records? Export a backup first.')))return;
    const fresh={progress:data.examProgress,attempts:data.examAttempts.slice(-7500),sessions:data.examSessions.slice(-400),grade:validGrade(data.examGrade)?data.examGrade:'2'};
    if(!(put('examProgress',fresh.progress)&&put('examAttempts',fresh.attempts)&&put('examSessions',fresh.sessions)&&put('examGrade',fresh.grade)&&put('examActive',null))){flash('保存できませんでした。');return}
    state.progress=fresh.progress;state.attempts=fresh.attempts;state.sessions=fresh.sessions;state.grade=fresh.grade;state.active=null;state.lastSession=null;flash(tx('仏検の記録を復元しました。','Exam record restored.'));go('records');
  }
  $('#examContent').addEventListener('click',e=>{
    const grade=e.target.closest('[data-grade]');if(grade){if(!validGrade(grade.dataset.grade))return;if(state.active)return;state.grade=grade.dataset.grade;put('examGrade',state.grade);render();return}
    const choice=e.target.closest('[data-choice]');if(choice){choiceAnswer(Number(choice.dataset.choice));return}
    const topic=e.target.closest('[data-topic]');if(topic){if(state.page==='records')initiate('adaptive',topic.dataset.topic);else initiate('adaptive',topic.dataset.topic);return}
    const start=e.target.closest('[data-start]');if(start){initiate(start.dataset.start);return}
    const page=e.target.closest('[data-page]');if(page){go(page.dataset.page);return}
    const self=e.target.closest('[data-self]');if(self){selfAssess(self.dataset.self==='yes');return}
    const exp=e.target.closest('[data-export]');if(exp){output(exp.dataset.export);return}
    const action=e.target.closest('[data-action]');if(!action)return;
    switch(action.dataset.action){case'check':checkInput();break;case'reveal':revealRewrite();break;case'next':advance();break;case'skip':skip();break;case'finish':finish(true);break;}
  });
  $('#examContent').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='examInput'&&e.target.tagName==='INPUT'){e.preventDefault();checkInput()}});
  $('#examContent').addEventListener('change',e=>{if(e.target.id==='examBackupFile'&&e.target.files?.[0])restore(e.target.files[0])});
  document.querySelectorAll('.exam-tab').forEach(b=>b.addEventListener('click',()=>{if(state.active){if(!confirm(tx('進行中の演習を終了して移動しますか？','End the current session before navigating?')))return;finish(false)}go(b.dataset.page)}));
  $('#examFont').addEventListener('click',()=>{state.large=!state.large;put('largeText',state.large);render()});
  $('#examLang').addEventListener('change',ev=>{if(!FSL_LANG.set(ev.target.value))return;state.lang=FSL_LANG.get();render()});
  // Defensive data check: fail visibly rather than silently accepting a malformed item.
  const ids=new Set();for(const q of questions){if(!validGrade(q.grade)||ids.has(q.id)||(q.kind==='choice'&&(!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3))){$('#examContent').textContent='教材の構造を確認してください: '+q.id;throw Error('Invalid exam question '+q.id)}ids.add(q.id)}
  // Check all six grade totals so missing expansion files cannot silently reduce the syllabus.
  const incompleteGrades=GRADE_ORDER.filter(g=>countGrade(g).length!==200);
  if(incompleteGrades.length){
    $('#examContent').innerHTML='<section class="panel"><h2>教材の読み込みに失敗しました</h2><p>仏検追加教材が読み込まれていません。ページを再読み込みし、続く場合は管理者にお知らせください。</p></section>';
    throw Error('Incomplete exam bank: '+incompleteGrades.map(g=>g+': '+countGrade(g).length).join(', '));
  }
  if(state.active&&(!validGrade(state.active.grade)||!Array.isArray(state.active.ids)||!state.active.ids.every(id=>byId.has(id)))){state.active=null;put('examActive',null)}
  if(state.active&&state.active.index<state.active.ids.length){
    state.grade=state.active.grade;state.page='study';
    const q=current(), saved=state.active.answers.slice().reverse().find(x=>x.questionId===q?.id);
    if(saved){state.chosen={entry:saved,index:q.kind==='choice'?q.options.indexOf(saved.response):null};state.typed=saved.response;state.revealed=q.kind==='rewrite';}
  }
  render();
})();
