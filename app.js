'use strict';
(() => {
  const APP_VERSION = '4.1';
  const LS = 'french-structure-lab:v1:';
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (k, fallback) => { try { const v=localStorage.getItem(LS+k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } };
  const save = (k, obj) => { try { localStorage.setItem(LS+k, JSON.stringify(obj)); return true; } catch(e) { toast('Storage is full or unavailable. Export a backup.'); return false; } };
  const dateToday = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const addDays = (from, n) => { const [y,m,d]=from.split('-').map(Number); const x=new Date(y,m-1,d+n,12); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
  const state = {
    lang:FSL_LANG.get(), largeText:read('largeText',false)===true,
    view:'today', progress:read('progress',{}), activity:read('activity',{}),
    userQuestions:read('userQuestions',[]), userSentences:read('userSentences',[]),
    selectedSentence:'s01', selectedToken:0, selectedVerb:'venir', selectedTense:'present',
    session:[], sessionIndex:0, sessionAnswer:null, sessionCorrect:0, mode:'daily',
    level:read('level','B1'), selectedUnit:read('unit','a1-greetings'), targetMinutes:read('targetMinutes',15),
    events:read('events',[]), sessions:read('sessions',[]), activeSession:read('activeSession',null),
    fuzzy:read('fuzzy',{}), readings:read('readings',{}), sessionFinished:false
  };
  const jp = () => state.lang === 'ja';
  const tx = (ja,en,fr) => FSL_LANG.t(ja,en,fr,state.lang);
  const immersion = (topic,level,ja,en) => state.lang==='fr' ? `<div class="fsl-immersion-note" lang="fr">${esc(FSL_LANG.tip(topic,level))}</div>${FSL_LANG.support(ja,en)}` : `<p>${esc(jp()?ja:en)}</p>`;
  const insights=window.FSL_INSIGHTS;
  const legacyLevels={q01:'B1',q02:'A2',q03:'B2',q04:'B1',q05:'B1',q06:'B1',q07:'A2',q08:'A2',q09:'A2',q10:'A2',q11:'A2',q12:'A2',q13:'B1',q14:'B2',q15:'B2',q16:'B1',q17:'B1',q18:'B1',q19:'A2',q20:'A2',q21:'B1',q22:'A1',q23:'A2',q24:'B2',q25:'A2',q26:'A2',q27:'A2',q28:'A2',q29:'B2',q30:'B1',q31:'B1',q32:'B1',q33:'B2',q34:'B1',q35:'B2',q36:'B1'};
  const validLevels=Object.keys(FSL_CURRICULUM.levels);
  if(!validLevels.includes(state.level))state.level='B1';
  const levelOf=q=>validLevels.includes(q.level)?q.level:(legacyLevels[q.id]||'B1');
  const questionBank = () => [...FSL_CURRICULUM.questions, ...FSL_DATA.questions, ...state.userQuestions];
  const levelQuestions = () => questionBank().filter(q=>levelOf(q)===state.level);
  const levelUnits = () => FSL_CURRICULUM.units.filter(u=>u.level===state.level);
  const localizedLevel = level=>FSL_CURRICULUM.levels[level];
  const startAt=(mode,ids)=>{
    if(state.activeSession){if(state.activeSession.attempts>0||state.activeSession.skipped>0)finishSession(false);else{state.activeSession=null;save('activeSession',null);}}
    state.session=ids;state.sessionIndex=0;state.sessionAnswer=null;state.sessionCorrect=0;state.mode=mode;state.sessionFinished=false;
    state.activeSession={id:'fsl:'+Date.now()+':'+Math.random().toString(36).slice(2,8),level:state.level,mode,startedAt:new Date().toISOString(),lastAt:new Date().toISOString(),activeMs:0,attempts:0,correct:0,skipped:0,questionIds:ids.slice(),index:0,answer:null,targetMinutes:state.targetMinutes};
    save('activeSession',state.activeSession);record('session_start',{mode,questionCount:ids.length});setView('today');
  };
  const clockText=ms=>{const n=Math.max(0,Math.round((ms||0)/1000));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`};
  const logDate=iso=>{const d=new Date(iso);return isFinite(d.getTime())?d.toLocaleString(jp()?'ja-JP':'en-GB',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'-'};
  const trackedTime=()=>state.activeSession?clockText(state.activeSession.activeMs):'0:00';
  function record(type,data={}){
    const stamp=new Date();const a=state.activeSession;
    if(a){const delta=stamp.getTime()-Date.parse(a.lastAt||a.startedAt);if(Number.isFinite(delta)&&delta>0&&delta<180000)a.activeMs+=delta;a.lastAt=stamp.toISOString();}
    const item={id:`ev:${stamp.getTime()}:${Math.random().toString(36).slice(2,7)}`,at:stamp.toISOString(),type,level:state.level,sessionId:a?.id||null,...data};
    state.events.push(item);if(state.events.length>10000)state.events=state.events.slice(-10000);
    save('events',state.events);if(a)save('activeSession',a);return item;
  }
  function finishSession(show=true){
    const a=state.activeSession;if(!a)return;
    if(!a.attempts&&!a.skipped){state.activeSession=null;save('activeSession',null);if(show)setView('records');return;}
    record('session_end',{answered:a.attempts,correct:a.correct});
    // Follow Chinese Structure Lab's session-boundary pattern: analyze only after ending a session.
    const analysis=insights.sessionReview(a,state.events,questionBank().map(q=>({...q,level:levelOf(q)})),state.progress,state.fuzzy,dateToday());
    const completed={...a,endedAt:new Date().toISOString(),date:a.startedAt.slice(0,10),accuracy:a.attempts?Math.round(a.correct/a.attempts*100):0,analysis};
    state.sessions.push(completed);if(state.sessions.length>500)state.sessions=state.sessions.slice(-500);
    save('sessions',state.sessions);state.activeSession=null;save('activeSession',null);
    state.sessionFinished=true; if(show)setView('records');
  }
  function resumeSession(){const a=state.activeSession;if(!a||!Array.isArray(a.questionIds)||!a.questionIds.length||!a.questionIds.every(id=>questionById(id)))return false;
    const last=Date.parse(a.lastAt||a.startedAt);
    if(Number.isFinite(last)&&Date.now()-last>=12*60*60*1000){state.level=validLevels.includes(a.level)?a.level:'B1';finishSession(false);return false;}
    state.level=validLevels.includes(a.level)?a.level:'B1';state.mode=a.mode||'daily';state.session=a.questionIds;state.sessionIndex=Math.max(0,Math.min(a.index||0,a.questionIds.length));state.sessionAnswer=Number.isInteger(a.answer)?a.answer:null;state.sessionCorrect=a.correct||0;
    // Time spent with the app closed is not counted as study time.
    a.lastAt=new Date().toISOString();save('activeSession',a);return true;}
  
  const sentenceBank = () => [...FSL_DATA.sentences, ...state.userSentences];
  const questionById = id => questionBank().find(q => q.id === id);
  const dayStreak = () => { let d=dateToday(); if (!state.activity[d]) d=addDays(d,-1); let count=0; while(state.activity[d]) { count++; d=addDays(d,-1); } return count; };
  const dueQuestions = (all=false) => questionBank().filter(q => (all||levelOf(q)===state.level)&&state.progress[q.id]&&state.progress[q.id].due <= dateToday());
  const answeredCount = () => Object.keys(state.progress).filter(id => questionById(id) && state.progress[id].attempts > 0).length;
  function toast(msg) { const e=$('#toast'); if (!e) return; e.textContent=msg; e.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>e.classList.remove('show'),2700); }
  function updateHeader() {
    document.body.classList.toggle('large-type',state.largeText);
    const fontButton=$('#fontSizeButton');if(fontButton){fontButton.setAttribute('aria-pressed',String(state.largeText));fontButton.textContent=state.largeText?'A−':'A＋';fontButton.title=tx('文字を大きく表示','Larger text');}
    $('#heroEyebrow').textContent=tx('FRENCH STUDY • A1〜C2 / 仏検4級〜1級','FRENCH STUDY • CEFR A1–C2');
    $('#heroTitle').innerHTML=tx('単語の意味から、<br>文のしくみへ。','Beyond vocabulary.<br>Discover sentence structure.');
    $('#heroDescription').innerHTML=tx('問題を解く。間違いを理解する。構造を見直す。<br class="wide-only">毎日10〜15分から始めるフランス語。','Try a question, understand the error, inspect the structure. <br class="wide-only">Build your French in 10–15 minutes a day.');
    $('#statAnswered').textContent=answeredCount(); $('#statDue').textContent=dueQuestions(true).length; $('#statStreak').textContent=dayStreak();
    $('#statAnsweredLabel').textContent=tx('解答した問題','Questions studied'); $('#statDueLabel').textContent=tx('今日の復習','Due today'); $('#statStreakLabel').textContent=tx('連続学習日','Day streak');
    $('#savedStatus').textContent=tx('● この端末に保存','● Saved locally');
    document.querySelectorAll('[data-ja][data-en]').forEach(e=>e.textContent=tx(e.getAttribute('data-ja'),e.getAttribute('data-en')));
    document.querySelectorAll('.nav-tab').forEach(e=>{e.classList.toggle('active',e.dataset.view===state.view);e.setAttribute('aria-current',e.dataset.view===state.view?'page':'false');});
    document.documentElement.lang=state.lang;
    FSL_LANG.applySelect('languageSelect');
    document.querySelectorAll('a.exam-nav').forEach(a=>{a.querySelector('span:last-child').textContent=a.getAttribute('href').includes('cognition')?tx('認知と文法','Cognition & grammar','Cognition et grammaire'):tx('仏検対策','Futsuken practice','Préparation au DAPF')});
    const sel=$('#levelSelect');if(sel){sel.value=state.level;sel.setAttribute('aria-label',tx('学習レベル','Study level'));}
    const quick=$('#quickInfo');if(quick)quick.textContent=`${state.level} · ${tx('全','All')} ${levelQuestions().length} ${tx('問題','questions')}`;
    $('#statDueLabel').textContent=tx('全レベルの復習','Reviews all levels');
  }
  function setView(view) { if(view==='today'&&!state.activeSession&&state.sessionFinished){startSession('daily');return;} state.view=view; updateHeader(); render(); window.scrollTo({top:0,behavior:'instant'}); }
  function distributed(arr) { const groups=new Map(); arr.forEach(q=>{if(!groups.has(q.category))groups.set(q.category,[]);groups.get(q.category).push(q);});const out=[]; let has=true;while(has){has=false; for(const a of groups.values())if(a.length){out.push(a.shift());has=true;}}return out; }
  function startSession(mode='daily') {
    const bank=distributed(levelQuestions()); const due=bank.filter(q => state.progress[q.id] && state.progress[q.id].due <= dateToday());
    const newItems=bank.filter(q => !state.progress[q.id]);
    const flagged=bank.filter(q=>(state.fuzzy[q.id]||state.progress[q.id]?.lastCorrect===false)&&!due.includes(q));
    let pick=mode==='review' ? due : [...due,...flagged,...newItems].filter((q,i,arr)=>arr.findIndex(x=>x.id===q.id)===i);
    if (!pick.length && mode==='daily') pick=bank.slice().sort((a,b)=>(state.progress[a.id]?.last || '').localeCompare(state.progress[b.id]?.last || ''));
    if(!pick.length){toast(tx('このレベルに復習問題はありません','No reviews due at this level'));setView('review');return;}startAt(mode,pick.slice(0,mode==='quick'?3:10).map(q=>q.id));
  }
  function markAnswer(q,correct){
    const old=state.progress[q.id]||{attempts:0,correct:0,stage:0};
    const stage=correct?Math.min((old.stage||0)+1,6):0;
    const steps=[1,1,3,7,14,30,60];
    state.progress[q.id]={attempts:old.attempts+1,correct:old.correct+(correct?1:0), stage, last:dateToday(),due:addDays(dateToday(),steps[stage]),lastCorrect:correct};
    state.activity[dateToday()]=(state.activity[dateToday()]||0)+1;
    if(state.activeSession){state.activeSession.attempts++;state.activeSession.correct+=Number(correct);state.activeSession.index=state.sessionIndex;state.activeSession.answer=state.sessionAnswer;}
    record('answer',{questionId:q.id,unitId:q.unit||null,category:q.category,correct,choice:state.sessionAnswer,solution:q.answer,review:(old.attempts||0)>0,stage,due:state.progress[q.id].due});
    save('progress',state.progress);save('activity',state.activity);
    state.sessionCorrect+=Number(correct);
    updateHeader();
  }
  function renderToday(){
    if(state.sessionIndex >= state.session.length){
      $('#content').innerHTML=`<section class="panel narrow"><p class="kicker">SESSION COMPLETE</p><h2>${tx('今日の練習は終了です','Session complete')}</h2><div class="grid3" style="margin-top:20px"><div class="info-card"><div class="metric-value">${state.session.length}</div><p>${tx('出題数','Questions')}</p></div><div class="info-card"><div class="metric-value">${state.sessionCorrect}</div><p>${tx('正解','Correct')}</p></div><div class="info-card"><div class="metric-value">${dueQuestions().length}</div><p>${tx('復習待ち','Due reviews')}</p></div></div><p class="subtle" style="margin-top:16px">${tx('学習結果はこの端末に保存されます。苦手な問題は間隔をあけて再登場します。','Your results are stored in this browser; review timing adapts to your answers.')}</p><div class="actions"><button class="primary-btn" data-action="finish-session">${tx('終了して学習記録へ','Save session & view records')}</button><button class="secondary-btn" data-action="view-analysis">${tx('文章を分析する','Explore sentences')}</button></div></section>`;return;
    }
    const q=questionById(state.session[state.sessionIndex]); if(!q) {startSession();return;}
    const answered=state.sessionAnswer !== null; const correct=answered && state.sessionAnswer===q.answer;
    const options=q.options.map((o,i)=>`<button type="button" class="option ${answered && i===q.answer?'correct':''} ${answered && i===state.sessionAnswer && !correct?'incorrect':''}" data-answer="${i}" ${answered?'disabled':''} aria-label="Option ${'ABCD'[i]}: ${esc(o)}"><span class="letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('');
    const explanation=answered?`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?tx('正解です。なぜこの形になる？','Correct. Why this form?'):tx('ここを整理しましょう','Let’s unpack this')}</strong><p class="model-sentence">${esc(q.sentence)}</p>${immersion(q.category,levelOf(q),q.ja+'\n'+q.whyJa,q.en+'\n'+q.whyEn)}<div class="actions"><button type="button" class="small-btn" data-action="speak-question">♪ ${tx('音読で確認','Listen')}</button><button type="button" class="small-btn ${state.fuzzy[q.id]?'marked':''}" data-action="toggle-fuzzy">${state.fuzzy[q.id]?tx('★ 苦手として記録中','★ Marked as tricky'):tx('☆ まだ曖昧・苦手','☆ Mark as unclear')}</button></div></div>`:'';
    $('#content').innerHTML=`<section class="panel narrow"><div class="section-head"><div><p class="kicker">${state.mode==='review'?'REVIEW':'DAILY PRACTICE'} / ${state.sessionIndex+1} OF ${state.session.length}</p><h2>${tx('もっとも自然な形を選んでください','Choose the most natural form')}</h2><p class="subtle">${tx('解説は答えた後に表示されます。','The explanation appears after you answer.')}</p></div><span class="pill">${esc(levelOf(q))} · ${esc(q.category)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round((state.sessionIndex+Number(answered))/state.session.length*100)}%"></div></div><p class="question fr">${esc(q.prompt)}</p><div class="options">${options}</div>${explanation}<div class="actions"><button type="button" class="ghost-btn" data-action="end-early">${tx('ここで学習を終了','Finish now')}</button>${answered?`<button type="button" class="primary-btn" data-action="next-question">${state.sessionIndex===state.session.length-1?tx('結果を見る','See results'):tx('次の問題へ','Next question')} →</button>`:`<button type="button" class="ghost-btn" data-action="skip-question">${tx('今回はスキップ','Skip for now')}</button>`}</div></section><div class="grid2"><div class="info-card"><h3>${tx('問題先行の学習','Question-first learning')}</h3><p>${tx('解説を読む前に一度考えることで、知識の取り出しを練習します。','Try retrieving the answer before reading the explanation.')}</p></div><div class="info-card"><h3>${tx('復習の間隔','Spaced review')}</h3><p>${tx('正解が続けば復習間隔を延ばし、誤答なら短い間隔に戻します。','Correct answers lengthen intervals; incorrect answers shorten them.')}</p></div></div>`;
  }
  function renderAnalysis(){
    const lessons=sentenceBank(), lesson=lessons.find(x=>x.id===state.selectedSentence)||lessons[0]; if(!lesson) {$('#content').innerHTML='';return;}
    const token=lesson.tokens[state.selectedToken]||lesson.tokens[0];
    const lHtml=lessons.map(l=>`<button class="lesson-btn ${l.id===lesson.id?'active':''}" data-sentence="${esc(l.id)}"><strong>${esc(l.original)}</strong><span>${esc(jp()?l.titleJa:l.titleEn)}</span></button>`).join('');
    const tHtml=lesson.tokens.map((t,i)=>`<button class="token ${i===state.selectedToken?'active':''}" data-token="${i}" aria-pressed="${i===state.selectedToken}">${esc(t.text)}</button>`).join('');
    $('#content').innerHTML=`<section class="panel"><div class="section-head"><div><p class="kicker">SENTENCE STRUCTURE</p><h2>${tx('文を分解して、文法を見えるようにする','See how each word functions')}</h2><p class="subtle">${tx('青い単語を押して、意味と文中の働きを調べます。','Tap any word to explore its meaning and grammatical role.')}</p></div><span class="pill green">${lessons.length} ${tx('例文','sentences')}</span></div><div class="grid2"><div><div class="lesson-list">${lHtml}</div></div><div><div class="between"><span class="pill">${esc(jp()?lesson.titleJa:lesson.titleEn)}</span><button class="small-btn" data-action="speak-sentence">♪ ${tx('フランス語を聴く','Listen')}</button></div><div class="sentence-stage"><div class="sentence-line">${tHtml}</div>${state.lang==='fr'?`<p class="fsl-immersion-note" lang="fr">Lis la phrase française, puis essaie d’en déduire le sens avant d’ouvrir une aide.</p>${FSL_LANG.support(lesson.translationJa,lesson.translationEn)}`:`<p class="analysis-translation">${esc(jp()?lesson.translationJa:lesson.translationEn)}</p>`}</div><div class="token-detail"><div class="between"><strong>${esc(token.text)} <span class="muted">← ${esc(token.lemma)}</span></strong><span class="pill">${esc(jp()?token.roleJa:token.roleEn)}</span></div>${immersion(token.roleJa,state.level,token.detailJa,token.detailEn)}</div><div class="divider"></div><h3 style="font-size:14px;margin:0 0 7px">${tx('文の骨組み','Sentence skeleton')}</h3>${immersion(lesson.noteEn,state.level,lesson.noteJa,lesson.noteEn)}<div class="actions"><button class="secondary-btn" data-action="next-sentence">${tx('次の例文','Next sentence')} →</button></div></div></div></section>`;
  }
  const persons=['je','tu','il / elle','nous','vous','ils / elles'];
  function conjugation(v,tense){
    const auxA=['ai','as','a','avons','avez','ont'], auxE=['suis','es','est','sommes','êtes','sont'];
    if(tense==='passe'){
      return (v.aux==='être'?auxE:auxA).map((a,i)=>{
        let pp=v.pp;
        if(v.aux==='être') pp=pp+(i===3||i===5?'s':i===4?'(s)':'');
        return `${a} ${pp}`;
      });
    }
    return v[tense];
  }
  function personForm(person,form,tense){
    const subject=person==='il / elle'?'il / elle':person==='ils / elles'?'ils / elles':person;
    const p=person==='je'&&/^[aeiouéèêâîôû]/i.test(form)?"j’":subject+' ';
    return (tense==='subjonctif'?'que ':'')+p+form;
  }
  function renderVerbs(){
    const v=FSL_DATA.verbs.find(x=>x.id===state.selectedVerb)||FSL_DATA.verbs[0], tense=state.selectedTense;
    const opts=FSL_DATA.verbs.map(x=>`<option value="${x.id}" ${x.id===v.id?'selected':''}>${esc(x.id)} — ${esc(jp()?x.ja:x.en)}</option>`).join('');
    const tenseNames={present:'Présent',imparfait:'Imparfait',passe:'Passé composé',futur:'Futur simple',conditionnel:'Conditionnel présent',subjonctif:'Subjonctif présent'};
    const tOpts=Object.keys(tenseNames).map(x=>`<option value="${x}" ${x===tense?'selected':''}>${tenseNames[x]}</option>`).join('');
    const forms=conjugation(v,tense).map((form,i)=>`<div><span>${tense==='subjonctif'?'que ':''}${persons[i]}</span><strong>${esc(form)}</strong></div>`).join('');
    const showAgree=tense==='passe'&&v.aux==='être';
    $('#content').innerHTML=`<section class="panel"><div class="section-head"><div><p class="kicker">VERB & TENSE LAB</p><h2>${tx('動詞の「形」が意味を変える','A verb form tells a story')}</h2><p class="subtle">${tx('時制・法を切り替えて、同じ動詞を比較できます。','Compare the same verb across tense and mood.')}</p></div></div><div class="verb-controls"><label class="control">${tx('動詞','Verb')}<select name="verb" id="verbSelect">${opts}</select></label><label class="control">${tx('時制・法','Tense / mood')}<select name="tense" id="tenseSelect">${tOpts}</select></label></div><div class="grid2"><div><div class="info-card" style="margin-bottom:14px">${state.lang==='fr'?`<strong lang="fr">${esc(FSL_LANG.tip(tense,state.level))}</strong>${FSL_LANG.support(FSL_DATA.tenseInfo[tense].ja,FSL_DATA.tenseInfo[tense].en)}`:`<strong>${esc(jp()?FSL_DATA.tenseInfo[tense].ja:FSL_DATA.tenseInfo[tense].en)}</strong>`}</div><div class="conjugation">${forms}</div><p class="subtle">${showAgree?tx('※ être を用いる複合過去の過去分詞は主語の性・数に一致。(e) は女性形、(s) は複数形を表します。','※ With être, participles agree with the subject: (e) = feminine and (s) = plural.'):tense==='passe'?tx('※ avoir を用いる複合過去。前置された直接目的語がある場合は過去分詞一致に注意。','※ With avoir, preceding direct objects can trigger past-participle agreement.') : ''}</p></div><div><div class="info-card"><h3>${tx('構造のポイント','Structural notes')}</h3>${immersion(v.id,state.level,v.usageJa,v.usageEn)}</div><div class="info-card" style="margin-top:13px"><h3>${tx('活用形を聴いて確認','Hear the conjugation')}</h3><p>${tx('一つの形を聴きたい場合は下から主語を選びます。音声は端末のフランス語音声機能を使います。','Choose a person to hear the form using the device’s French voice.')}</p><div class="pills" style="margin-top:13px">${conjugation(v,tense).map((form,i)=>`<button class="small-btn" data-speak-form="${i}">${esc(persons[i])}</button>`).join('')}</div></div><div class="divider"></div><h3 style="font-size:14px">${tx('形を選ぶ理由','Why choose this form?')}</h3><p class="subtle">${tx('「今起きている」「過去に繰り返した」「過去の一点で完了した」「仮定する」「必要を述べる」をまず区別します。語尾暗記だけでなく、意味から活用を選びます。','First identify meaning: ongoing, habitual past, completed past, hypothetical, or necessary. The situation selects the form—not just memorized endings.')}</p></div></div></section>`;
  }
  function renderReview(){
    const stats=Object.entries(state.progress).filter(([id,x])=>x.attempts>0&&questionById(id)&&levelOf(questionById(id))===state.level).map(x=>x[1]), due=dueQuestions();
    const total=stats.reduce((n,x)=>n+x.attempts,0), correct=stats.reduce((n,x)=>n+x.correct,0);
    const weak=levelQuestions().filter(q=>state.fuzzy[q.id]||state.progress[q.id]?.lastCorrect===false).slice(0,8);
    $('#content').innerHTML=`<section class="panel"><div class="section-head"><div><p class="kicker">SPACED REVIEW</p><h2>${tx('忘れかけた頃に、もう一度','Return just before you forget')}</h2><p class="subtle">${tx('学習記録はこのブラウザの中だけに保存されます。','Study records stay in this browser.')}</p></div></div><div class="grid3"><div class="info-card"><div class="metric-value">${total}</div><p>${tx('これまでの総解答','Total attempts')}</p></div><div class="info-card"><div class="metric-value">${total?Math.round(correct/total*100):0}%</div><p>${tx('全解答の正答率','Accuracy across attempts')}</p></div><div class="info-card"><div class="metric-value">${due.length}</div><p>${tx('今日の復習待ち','Reviews due today')}</p></div></div><div class="actions"><button class="primary-btn" data-action="start-review" ${!due.length?'disabled':''}>${tx('復習問題を始める','Start due reviews')} (${due.length})</button><button class="secondary-btn" data-action="start-daily">${tx('通常の練習','Regular practice')}</button></div><div class="divider"></div><h3>${tx('直近の苦手項目','Recent trouble spots')}</h3>${weak.length?`<div class="lesson-list" style="margin-top:12px">${weak.map(q=>`<div class="lesson-btn"><strong>${esc(q.sentence)}</strong>${state.lang==='fr'?FSL_LANG.support(q.whyJa,q.whyEn):`<span>${esc(jp()?q.whyJa:q.whyEn)}</span>`}</div>`).join('')}</div>`:`<div class="empty"><strong>${tx('まだ苦手項目はありません','No incorrect answers yet')}</strong>${tx('問題を解くと、ここに復習の手がかりが表示されます。','Study some questions to see relevant review prompts.')}</div>`}<div class="divider"></div><h3>${tx('学習データを外へ持ち出す','Take your learning data with you')}</h3><p class="subtle">${tx('Anki取り込み用CSV、Learning OS連携用のJSON、端末移行用バックアップを出力できます。Learning OSへの自動転送はまだ未接続です。','Export Anki-ready CSV, a Learning OS interchange JSON, or a full backup. Automatic transfer to Learning OS is not connected yet.')}</p><div class="actions"><button class="secondary-btn" data-action="export-anki">${tx('Anki用CSV','Anki CSV')}</button><button class="secondary-btn" data-action="export-cards">${tx('復習カードJSON','Review card JSON')}</button><button class="ghost-btn" data-action="export-backup">${tx('全データのバックアップ','Full backup')}</button></div></section>`;
  }
  function renderCourses(){
    const units=FSL_CURRICULUM.units;
    const active=units.find(u=>u.id===state.selectedUnit&&u.level===state.level)||levelUnits()[0];
    if(!active)return;
    state.selectedUnit=active.id;
    const pills=validLevels.map(level=>{
      const items=questionBank().filter(q=>levelOf(q)===level);
      const studied=items.filter(q=>state.progress[q.id]?.attempts>0).length;
      return `<button type="button" class="level-card ${state.level===level?'selected':''}" data-level="${level}" aria-pressed="${state.level===level}"><strong>${level}</strong><span>${esc(jp()?localizedLevel(level).ja:localizedLevel(level).en)}</span><small>${studied}/${items.length} ${tx('問題に挑戦','questions tried')}</small></button>`;
    }).join('');
    const unitButtons=levelUnits().map(u=>{
      const studied=u.items.filter(q=>state.progress[q.id]?.attempts>0).length;
      const checked=state.readings[u.id]?.count||0;
      return `<button type="button" class="unit-card ${active.id===u.id?'selected':''}" data-unit="${u.id}"><strong>${esc(jp()?u.titleJa:u.titleEn)}</strong><span>${studied}/${u.items.length} ${tx('問題','questions')} · ${checked?tx('読解済み','read'):'—'}</span></button>`;
    }).join('');
    const rank=localizedLevel(state.level);
    const previews=active.items.map((q,i)=>`<div class="unit-preview"><b>${i+1}. ${esc(q.prompt)}</b>${state.lang==='fr'?`<span lang="fr">Essaie d’abord de comprendre la phrase française.</span>`:`<span>${esc(jp()?q.ja:q.en)}</span>`}</div>`).join('');
    $('#content').innerHTML=`<section class="panel"><p class="kicker">SIX-LEVEL CURRICULUM · A1—C2</p><div class="section-head"><div><h2>${tx('レベル別のフランス語教材','French by proficiency level')}</h2><p class="subtle">${tx('各レベル3ユニット。短い読解・構造の解説・4問の確認問題を収録。','Three units per level: reading, structure notes, four questions.')}</p></div><span class="pill green">${FSL_CURRICULUM.questions.length} ${tx('追加問題','new questions')}</span></div><div class="level-grid">${pills}</div></section>
      <section class="panel"><div class="section-head"><div><p class="kicker">${state.level} · ${esc(jp()?rank.ja:rank.en)}</p><h2>${esc(jp()?rank.descJa:rank.descEn)}</h2></div></div><div class="unit-grid">${unitButtons}</div><div class="divider"></div>
      <div class="study-reading"><div class="between"><span class="pill">READ · ${state.level}</span><button class="small-btn" type="button" data-action="listen-reading">♪ ${tx('フランス語音声','Read aloud')}</button></div><h3>${esc(jp()?active.titleJa:active.titleEn)}</h3><div class="reading-text fr" lang="fr">${esc(active.reading)}</div>${state.lang==='fr'?`<div class="fsl-immersion-note" lang="fr">Imagine la scène. Qui parle ? Que se passe-t-il ? Repère les indices dans le texte.</div>${FSL_LANG.support(active.translationJa+'\n'+active.goalJa,active.translationEn+'\n'+active.goalEn)}`:`<p class="reading-translation">${esc(jp()?active.translationJa:active.translationEn)}</p><p class="subtle">${esc(jp()?active.goalJa:active.goalEn)}</p>`}<div class="focus-box"><strong>${tx('構造の手がかり','Structure focus')}</strong>${immersion(active.focusJa,state.level,active.focusJa,active.focusEn)}</div><div class="actions"><button class="secondary-btn" type="button" data-action="read-complete">${state.readings[active.id]?.count?'✓ '+tx('読解をもう一度記録','Record another reading'):tx('読んだことを記録','Mark reading done')}</button></div></div>
      <h3 class="unit-heading">${tx('確認問題のテーマ','Practice questions')}</h3><div class="unit-previews">${previews}</div><div class="duration-row"><label class="control">${tx('学習時間の目安','Session target')}<select id="durationSelect">${[3,10,15,25,45].map(n=>`<option value="${n}" ${state.targetMinutes===n?'selected':''}>${n}${tx('分',' min')}</option>`).join('')}</select></label><small>${tx('所要時間は目安。時間になっても自動終了しません。','A target only; sessions never stop automatically.')}</small></div><div class="actions"><button class="primary-btn" type="button" data-action="start-unit">${tx('このユニットを4問練習','Practice this unit (4)')}</button><button class="secondary-btn" type="button" data-action="start-daily">${state.level} ${tx('の10問を練習','mixed practice (10)')}</button><button class="ghost-btn" type="button" data-action="start-quick">${tx('3問で短時間復習','Quick 3 questions')}</button></div>
      <p class="notice">${tx('CEFRに沿った学習開始用の教材です。この問題数の達成だけで該当レベルを習得した判定にはなりません。','Starter material aligned with CEFR skills—not an official proficiency or certification assessment.')}</p></section>`;
  }
  function renderRecords(){
    const events=state.events.filter(e=>e.type==='answer');
    const bank=questionBank().map(q=>({...q,level:levelOf(q)}));
    const topicInfo=insights.topicStats(state.events,bank,state.level);
    const journeys=insights.timeline(state.events,bank,state.progress,state.fuzzy,state.level);
    const focusPlan=insights.nextPlan(state.events,bank,state.progress,state.fuzzy,state.level,dateToday(),8);
    const rebounds=journeys.filter(x=>x.recovered);
    const right=events.filter(e=>e.correct).length, count=events.length;
    const totalMinutes=state.sessions.reduce((n,s)=>n+(s.activeMs||0),0);
    const last28=Array.from({length:28},(_,i)=>addDays(dateToday(),i-27));
    const cells=last28.map(d=>{const n=state.activity[d]||0;return `<div class="heat-cell tone-${n?Math.min(4,Math.ceil(n/3)):0}" title="${d}: ${n} ${tx('問','answers')}"><span>${Number(d.slice(-2))}</span></div>`}).join('');
    const byLevel=validLevels.map(l=>{const ev=events.filter(e=>e.level===l), studied=questionBank().filter(q=>levelOf(q)===l&&state.progress[q.id]?.attempts>0).length;
      const n=questionBank().filter(q=>levelOf(q)===l).length;
      const rate=ev.length?Math.round(ev.filter(e=>e.correct).length/ev.length*100):0;
      return `<div class="level-stat"><strong>${l}</strong><div class="level-stat-bars"><div class="stat-track"><div style="width:${Math.round(studied/Math.max(n,1)*100)}%"></div></div><small>${studied}/${n} ${tx('問','tried')} · ${ev.length?rate+'%':tx('未計測','not rated')}</small></div></div>`}).join('');
    const category={};events.forEach(e=>{if(!e.correct){const k=e.category||'Other';category[k]=(category[k]||0)+1;}});
    const weak=Object.entries(category).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const problemCounts={};events.forEach(e=>{if(e.questionId){const k=e.questionId;const v=problemCounts[k]||{times:0,wrong:0,last:''};v.times++;v.wrong+=!e.correct;v.last=e.at;problemCounts[k]=v;}});
    const shaky=Object.entries(problemCounts).filter(([id,v])=>v.wrong>0||state.fuzzy[id]).sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,8);
    const recentEvents=state.events.filter(e=>['answer','fuzzy_changed','reading_completed','skip','audio_played','word_touch'].includes(e.type)).slice(-18).reverse();
    const labelEvent=e=>e.type==='answer'?(e.correct?tx('正解','Correct'):tx('誤答','Incorrect')):e.type==='reading_completed'?tx('読解','Reading'):e.type==='skip'?tx('スキップ','Skipped'):e.type==='audio_played'?tx('音声再生','Audio played'):e.type==='word_touch'?tx('単語分析','Word analyzed'):tx('苦手印を変更','Fuzzy flag changed');
    const dueNext=dueQuestions();
    const plan=[...dueNext,...levelQuestions().filter(q=>state.fuzzy[q.id]||state.progress[q.id]?.lastCorrect===false)].filter((q,i,arr)=>arr.findIndex(p=>p.id===q.id)===i).slice(0,5);
    const planHtml=plan.length?plan.map(q=>`<div class="plan-item"><b>${esc(q.sentence)}</b><span>${esc(q.category)} · ${state.progress[q.id]?.due<=dateToday()?tx('復習期日が到来','Due today'):tx('苦手・再挑戦候補','Marked for extra practice')}</span></div>`).join(''):`<p class="subtle">${tx('復習期限の問題や苦手印がないため、選択中レベルの新しい教材に進めます。','No due or flagged items in this level. You can continue with new material.')}</p>`;

    const reasonLabel=code=>({due:tx('復習期限が到来','Due for review'),flagged:tx('苦手印が付いている','Marked unclear'),retry:tx('前回間違えた','Last attempt incorrect'),new:tx('未学習','Not yet studied'),strengthen:tx('定着を確認','Strengthen recall')})[code]||code;
    const focusHtml=focusPlan.map(p=>`<div class="focus-card"><div><b class="fr">${esc(p.sentence)}</b><span>${esc(p.category)} · ${reasonLabel(p.reason)}${p.due?' · '+esc(p.due):''}</span></div><button type="button" class="small-btn" data-focus-id="${esc(p.id)}">${tx('解き直す','Try again')}</button></div>`).join('');
    const journeysHtml=journeys.filter(x=>x.attempts>0||x.flagged).slice(0,8).map(j=>`<div class="journey-card"><div><strong class="fr">${esc(j.sentence)}</strong><small>${esc(j.category)} · ${j.attempts} ${tx('回の解答','attempts')} · ${j.wrong} ${tx('回の誤答','incorrect')}</small></div><div class="journey-history" aria-label="${tx('最近の解答履歴','Recent answer history')}">${j.history.map(h=>`<span class="journey-dot ${h.correct?'is-correct':'is-wrong'}" title="${esc(logDate(h.at))} ${h.correct?tx('正解','correct'):tx('誤答','incorrect')}">${h.correct?'✓':'×'}</span>`).join('')}${j.recovered?`<span class="pill green">${tx('誤答後に正解','Improved after error')}</span>`:''}</div></div>`).join('');
    const recentSessions=state.sessions.slice(-10).reverse().map((s,i)=>`<details class="session-row" ${i===0&&state.sessionFinished?'open':''}><summary><strong>${esc(logDate(s.startedAt))}</strong><span>${esc(s.level)} · ${s.attempts} ${tx('問','answers')} · ${s.accuracy}% · ${clockText(s.activeMs)} ${tx('活動時間（概算）','estimated active')}</span></summary><p class="subtle">${tx('スキップ','Skipped')}: ${s.skipped||0} · ${tx('形式','Mode')}: ${esc(s.mode)}</p>${s.analysis?.weakTopics?.length?`<p class="session-note"><b>${tx('この回の誤答分野','Topics missed this session')}：</b>${s.analysis.weakTopics.map(t=>esc(t.topic)+' ('+Number(t.count)+')').join(' / ')}</p>`:''}${s.reflection?`<p class="session-note">${esc(s.reflection)}</p>`:''}${i===0?`<label class="field-label" for="reflectionInput">${tx('理解した点・曖昧な点・次回やること','What you learned, what is unclear, and next steps')}</label><textarea id="reflectionInput" rows="3" maxlength="1000" placeholder="${tx('例：venir de は理解した。代名詞の順序は再確認する。','e.g. I understand venir de; review clitic order next.')}">${esc(s.reflection||'')}</textarea><button class="secondary-btn" type="button" data-action="save-reflection">${tx('振り返りを保存','Save reflection')}</button>`:''}</details>`).join('');
    $('#content').innerHTML=`<section class="panel"><p class="kicker">COGNITION STUDIO · NEW LEARNING PATH</p><h3>${tx('認知と文法の学習記録','Cognition and grammar learning')}</h3><p>${tx('状況判断・文法選択・別場面への応用を記録します。','Track situation judgments, grammar choices and transfer to new scenes.')} ${Array.isArray(read('cognitionAttempts',[]))?read('cognitionAttempts',[]).length:0} ${tx('件の回答履歴','recorded responses')}</p><p><a href="./cognition.html">${tx('認知と文法スタジオを開く','Open Cognition Studio')}</a></p></section><section class="panel"><div class="section-head"><div><p class="kicker">LEARNING LEDGER · CHINESE STRUCTURE LAB INSPIRED</p><h2>${tx('学習記録と理解の変化','Learning records and progress')}</h2><p class="subtle">${tx('解答のたびに履歴を残し、学習終了後にまとめて振り返ります。','Every answer is recorded; review your history at session boundaries.')}</p></div></div><div class="grid3"><div class="info-card"><div class="metric-value">${count}</div><p>${tx('詳細履歴のある解答','Recorded answers')}</p></div><div class="info-card"><div class="metric-value">${count?Math.round(right/count*100):'—'}${count?'%':''}</div><p>${tx('記録内の正答率','Recorded accuracy')}</p></div><div class="info-card"><div class="metric-value">${clockText(totalMinutes)}</div><p>${tx('学習活動時間（概算）','Estimated active time')}</p></div></div><p class="notice">${tx('旧版から引き継いだ問題別の正答数も保存されますが、詳細履歴・時間は本バージョンから記録します。活動時間は操作間の短い区間を合計した概算で、実測の全学習時間ではありません。','Existing item totals are retained, but event and time logs begin with this version. Active time is an estimate from short intervals between interactions.')}</p></section>
    <section class="panel"><div class="section-head"><div><p class="kicker">28-DAY ACTIVITY</p><h2>${tx('過去28日の練習','Last 28 days')}</h2></div><span class="pill">${dayStreak()} ${tx('日連続','day streak')}</span></div><div class="heatmap">${cells}</div><p class="subtle">${tx('濃いほど回答数が多い（過去の記録も含む）。','Darker cells mean more answers, including legacy counts.')}</p><div class="divider"></div><h3>${tx('レベル別の到達状況','By-level study coverage')}</h3><div class="levels-stat">${byLevel}</div></section>
    <section class="panel"><div class="section-head"><div><p class="kicker">STUDY PATTERNS</p><h2>${tx('苦手と再挑戦の足跡','Trouble spots and repeated encounters')}</h2></div></div>${weak.length?`<div class="weak-grid">${weak.map(([name,n])=>`<div class="weak-label"><span>${esc(name)}</span><strong>${n} ${tx('回の誤答','errors')}</strong></div>`).join('')}</div>`:`<p class="subtle">${tx('誤答を記録すると、ここに文法分野が表示されます。','Grammar trouble spots appear after incorrect answers.')}</p>`}<div class="divider"></div>${shaky.length?`<div class="lesson-list">${shaky.map(([id,v])=>{const q=questionById(id);return q?`<div class="lesson-btn"><strong>${esc(q.sentence)}</strong><span>${levelOf(q)} · ${v.times} ${tx('回答','attempts')} / ${v.wrong} ${tx('誤答','errors')} ${state.fuzzy[id]?'· ★ '+tx('苦手','fuzzy'):''}</span></div>`:''}).join('')}</div>`:`<p class="subtle">${tx('苦手印をつけた文や誤答した文がここに集まります。','Flagged and incorrect sentences will appear here.')}</p>`}</section>
    <section class="panel"><div class="section-head"><div><p class="kicker">QUESTION JOURNEY · ${state.level}</p><h2>${tx('同じ問題に、何度も出会う','Revisiting the same questions')}</h2><p class="subtle">${tx('×は誤答、✓は正解。誤答の後で正解できた履歴を見えるようにします。','× means incorrect, ✓ correct; later correct answers are visible after mistakes.')}</p></div><span class="pill green">${rebounds.length} ${tx('問で改善の兆し','positive transitions')}</span></div>${journeysHtml||`<p class="subtle">${tx('まだ解答履歴はありません。','No attempt history yet.')}</p>`}<p class="notice">${tx('これは記録された選択問題の変化です。C1・C2の運用能力や習得を認定するものではありません。','These are changes in recorded multiple-choice answers, not certification of C1/C2 proficiency or mastery.')}</p></section>
    <section class="panel"><div class="section-head"><div><p class="kicker">TOPIC FOCUS · ${state.level}</p><h2>${tx('文法分野ごとの再挑戦','Practice a difficult grammar topic')}</h2></div></div>${topicInfo.filter(t=>t.wrong>0).length?`<div class="topic-actions">${topicInfo.filter(t=>t.wrong>0).slice(0,6).map(t=>`<button type="button" class="topic-action" data-focus-topic="${esc(t.topic)}"><b>${esc(t.topic)}</b><span>${t.wrong}/${t.attempts} ${tx('回の誤答','incorrect')} · ${tx('この分野を練習','Practice this topic')} →</span></button>`).join('')}</div>`:`<p class="subtle">${tx('このレベルに誤答履歴ができると、分野を選んで集中練習できます。','After an incorrect answer, focus practice by topic becomes available.')}</p>`}</section>
    <section class="panel"><div class="section-head"><div><p class="kicker">NEXT SESSION</p><h2>${state.level} · ${tx('次の学習候補','Next practice suggestions')}</h2></div><span class="pill green">${dueNext.length} ${tx('件が復習期限','due')}</span></div><div class="plan-list">${planHtml}</div><h3>${tx('優先順位と根拠（このレベル）','Priorities and reasons (this level)')}</h3><div class="focus-list">${focusHtml}</div><div class="actions"><button class="primary-btn" data-action="start-daily">${tx('次の10問へ','Start next 10')}</button><button class="secondary-btn" data-action="start-review" ${dueNext.length?'':'disabled'}>${tx('期限の復習を優先','Review due items')}</button></div><p class="notice">${tx('提案は復習期限と苦手印から選んでいます。外部AIによる理解度判定ではありません。','Suggestions are drawn from due dates and flagged difficulty, not AI inference.')}</p></section>
    <section class="panel"><div class="section-head"><div><p class="kicker">SESSION HISTORY</p><h2>${tx('学習セッションと振り返り','Sessions and reflections')}</h2></div></div>${recentSessions||`<p class="subtle">${tx('学習セッションを終了すると、履歴が表示されます。','Finish a practice session to record it here.')}</p>`}<div class="divider"></div><h3>${tx('最近の学習操作','Recent learning events')}</h3><div class="event-list">${recentEvents.length?recentEvents.map(e=>`<div class="event"><time>${esc(logDate(e.at))}</time><span>${esc(e.level||'-')}</span><strong>${labelEvent(e)}</strong><small>${esc(e.questionId||e.unitId||e.sentenceId||'')}</small></div>`).join(''):`<p class="subtle">${tx('記録はまだありません。','No events recorded yet.')}</p>`}</div></section>
    <section class="panel"><p class="kicker">YOUR DATA</p><h2>${tx('学習記録を持ち運ぶ','Own and export your records')}</h2><div class="actions"><button class="primary-btn" data-action="export-backup">${tx('完全バックアップJSON','Full backup JSON')}</button><button class="secondary-btn" data-action="export-history">${tx('解答履歴CSV','Answer history CSV')}</button><button class="secondary-btn" data-action="export-cards">${tx('復習カードJSON','Review cards JSON')}</button><button class="secondary-btn" data-action="export-ai-report">${tx('AI分析用・詳細学習データJSON','Detailed JSON report for AI')}</button></div><div class="divider"></div><label class="field-label" for="backupFile">${tx('バックアップから復元（現在の記録を置換）','Restore backup (replaces current records)')}</label><input class="file-input" id="backupFile" type="file" accept=".json,application/json"><p class="notice">${tx('端末内のみで保存。iCloud Driveには「バックアップJSON」をファイルとして保存できますが、端末間の自動同期はありません。','Stored on this device only. You may save a backup JSON to iCloud Drive, but automatic device-to-device sync is not available.')}</p></section>`;
  }

  const promptAI = `You are a specialist in French grammar, morphosyntax, conjugation, and language pedagogy. Create accurate French study content for French Structure Lab, especially for Japanese learners preparing for Futsuken grade 2. Output ONLY a valid JSON object (no Markdown).
Schema: {"schemaVersion":"1.0","language":"fr","exercises":[{"id":"unique-key","level":"B1","category":"時制","prompt":"Je ___ français.","options":["parle","parles","parlons","parlez"],"answer":0,"sentence":"Je parle français.","ja":"私はフランス語を話します。","en":"I speak French.","whyJa":"なぜこの形なのか説明。","whyEn":"Explain why this form is correct."}],"sentences":[{"id":"unique-sentence-key","titleJa":"文法項目","titleEn":"Grammar topic","original":"Je parle français.","translationJa":"私はフランス語を話します。","translationEn":"I speak French.","noteJa":"文の構造を説明。","noteEn":"Explain sentence structure.","tokens":[{"text":"Je","lemma":"je","roleJa":"主語","roleEn":"subject","detailJa":"文中の働きの説明。","detailEn":"Explain its grammatical role."},{"text":"parle","lemma":"parler","roleJa":"直説法現在","roleEn":"present indicative","detailJa":"je に対応する現在形。","detailEn":"Present indicative form for je."},{"text":"français.","lemma":"français","roleJa":"直接目的語","roleEn":"direct object","detailJa":"話す言語。","detailEn":"Language spoken."}]}]}
Preserve French spelling, accents, apostrophes, and original word order. Include every word in the sentence as a token, preserving punctuation attached to a word. Ensure the listed tokens reconstruct 'original' when joined with spaces, except for standard spacing around punctuation. Every multiple-choice question must have exactly one defensible correct option, and the marked answer must match 'sentence'. Explanations should identify the relevant grammatical principle, morphology, and any exceptions. Avoid misleading or unnatural French. Do not invent unsupported grammatical rules. Generate 10 exercises and 3 fully analyzed sentences at CEFR level [A1/A2/B1/B2/C1/C2] on the theme: [INSERT TOPIC].`;
  const sampleJSON = {
    schemaVersion:'1.0',language:'fr',
    exercises:[{id:'devoir-01',category:'接続法',prompt:'Il faut que nous ___ prêts.',options:['sommes','soyons','serons','étions'],answer:1,sentence:'Il faut que nous soyons prêts.',ja:'私たちは準備ができていなければなりません。',en:'We must be ready.',whyJa:'il faut que の後は接続法。être の nous 形は soyons。',whyEn:'Il faut que triggers the subjunctive; être → soyons.'}],
    sentences:[{id:'venir-01',titleJa:'直近過去',titleEn:'Recent past',original:'Je viens de partir.',translationJa:'私は出発したばかりです。',translationEn:'I have just left.',noteJa:'venir de + 不定詞 = 〜したばかり。',noteEn:'Venir de + infinitive expresses the recent past.',tokens:[{text:'Je',lemma:'je',roleJa:'主語',roleEn:'subject',detailJa:'話し手。',detailEn:'The speaker.'},{text:'viens',lemma:'venir',roleJa:'現在形',roleEn:'present',detailJa:'venir の一人称単数現在。',detailEn:'First-person present of venir.'},{text:'de',lemma:'de',roleJa:'構文',roleEn:'linker',detailJa:'venir de の de。',detailEn:'Part of venir de.'},{text:'partir.',lemma:'partir',roleJa:'不定詞',roleEn:'infinitive',detailJa:'出発する。',detailEn:'To leave.'}]}]
  };
  function renderLibraryBase(){
    $('#content').innerHTML=`<section class="panel"><div class="section-head"><div><p class="kicker">AI → FRENCH LAB</p><h2>${tx('AIの教材を、学習アプリの資産に','Turn AI explanations into your library')}</h2><p class="subtle">${tx('フランス語の教材JSONを貼り付けるか、ファイルから取り込みます。','Paste lesson JSON or import it from a file.')}</p></div><span class="pill">${state.userQuestions.length} ${tx('追加問題','new questions')} / ${state.userSentences.length} ${tx('追加例文','sentences')}</span></div><div class="grid2"><div><label class="field-label" for="jsonInput">${tx('教材JSONを貼り付け','Paste content JSON')}</label><textarea id="jsonInput" spellcheck="false" placeholder='{"schemaVersion":"1.0","language":"fr", ...}'></textarea><div class="actions"><button class="primary-btn" data-action="import-json">${tx('取り込む','Import JSON')}</button><button class="secondary-btn" data-action="insert-sample">${tx('例を入力','Show example')}</button></div><div class="divider"></div><label class="field-label" for="jsonFile">${tx('JSONファイルから取り込む','Import from JSON file')}</label><input class="file-input" id="jsonFile" type="file" accept=".json,application/json"><p class="notice">${tx('教材は端末内に保存されます。作成したデータは定期的にバックアップしてください。','Content is stored on your device. Export backups regularly.')}</p></div><div><div class="info-card"><h3>${tx('ChatGPTに教材を生成してもらう','Generate content with ChatGPT')}</h3><p>${tx('この専用プロンプトをコピーし、テーマを指定してJSONを生成できます。','Copy the prompt below, supply a topic, and generate structured JSON.')}</p><div class="actions"><button class="secondary-btn" data-action="copy-prompt">${tx('生成プロンプトをコピー','Copy generation prompt')}</button><button class="ghost-btn" data-action="download-sample">${tx('JSON見本を保存','Save sample JSON')}</button></div></div><div class="info-card" style="margin-top:12px"><h3>${tx('どこまで連携している？','What is connected?')}</h3><p>${tx('JSON取り込み、問題演習、文章分析、CSV・復習カード出力が使えます。Russian Structure Lab / Learning OS との自動同期は未実装です。','JSON import, practice, sentence analysis, CSV and card exports work. Automatic sync with Russian Structure Lab / Learning OS is not implemented.')}</p></div><div class="info-card" style="margin-top:12px"><h3>${tx('教材の安全性','Content checks')}</h3><p>${tx('形式・回答番号・文字数を検査してから保存します。ただし、AIの文法解説の正しさは自動保証できません。','The importer checks structure, answer indices, and length. AI-generated grammar accuracy still needs human review.')}</p></div></div></div></section>`;
  }
  function renderLibrary(){renderLibraryBase();$('#content').insertAdjacentHTML('beforeend',`<section class="panel"><h2>${tx('学習データを復元する','Restore a study backup')}</h2><p class="subtle">${tx('既存の記録を置き換えるため、必ず先にバックアップを保存してください。','Restoring replaces existing records. Export your current backup first.')}</p><label class="field-label" for="backupFile">${tx('バックアップJSONファイル','Backup JSON')}</label><input class="file-input" id="backupFile" type="file" accept=".json,application/json"></section>`);}
  function renderExamPanel(){
    const examAttempts=read('examAttempts',[]), examSessions=read('examSessions',[]);
    const count=Array.isArray(examAttempts)?examAttempts.length:0;
    const sessions=Array.isArray(examSessions)?examSessions.length:0;
    $('#content').insertAdjacentHTML('beforeend',`<section class="panel"><p class="kicker">FUTSUKEN · GRAMMAR EXAM</p><h2>${tx('仏検4級〜1級の学習記録','Futsuken grammar study records')}</h2><p class="subtle">${tx('CEFR学習とは別の軸として、文法・語法・書き換えの解答を記録しています。','Exam practice is tracked separately from your CEFR progress.')}</p><div class="grid3" style="margin:18px 0"><div class="info-card"><div class="metric-value">${count}</div><p>${tx('仏検の累計解答','Exam attempts')}</p></div><div class="info-card"><div class="metric-value">${sessions}</div><p>${tx('終了した演習','Completed sets')}</p></div><div class="info-card"><div class="metric-value">${count?Math.round(100*examAttempts.filter(e=>e.correct).length/count)+'%':'—'}</div><p>${tx('記録内の正答率','Recorded accuracy')}</p></div></div><div class="actions"><a class="secondary-btn" href="./exam.html">${tx('仏検対策・級別の学習記録を開く','Open Futsuken practice and ledger')} →</a></div></section>`);
  }
  function render(){updateHeader(); if(state.view==='today')renderToday();else if(state.view==='analysis')renderAnalysis();else if(state.view==='verbs')renderVerbs();else if(state.view==='review')renderReview();else if(state.view==='courses')renderCourses();else if(state.view==='records'){renderRecords();renderExamPanel();}else renderLibrary();} 
  function speak(text){ if(!('speechSynthesis' in window)){toast(tx('音声再生に対応していないブラウザです','Speech is not available in this browser'));return;} try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/\(e\)|\(s\)/g,''));u.lang='fr-FR';u.rate=.86;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase().startsWith('fr'))||null;speechSynthesis.speak(u);}catch{toast(tx('音声を開始できませんでした','Could not play speech'));} }
  function exportFile(filename,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(tx('ファイルを書き出しました','File exported'));}
  const csv = s=>'"'+String(s).replace(/"/g,'""')+'"';
  function exportAnki(){const rows=[['Front','Back','Tags']];questionBank().forEach(q=>rows.push([q.prompt,q.sentence+'\n'+(jp()?q.whyJa:q.whyEn),'FrenchStructureLab '+levelOf(q)+' '+q.category.replace(/\s/g,'_')]));exportFile('french-structure-lab-anki.csv','\ufeff'+rows.map(r=>r.map(csv).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
  function exportCards(){const records=questionBank().map(q=>({id:q.id,sourceApp:'French Structure Lab',language:'fr',front:q.prompt,back:q.sentence+'\n'+(jp()?q.whyJa:q.whyEn),category:q.category,level:levelOf(q),unitId:q.unit||null,progress:state.progress[q.id]||null}));exportFile('french-structure-lab-cards.json',JSON.stringify({format:'learning-cards',version:'1.0',exportedAt:new Date().toISOString(),cards:records},null,2),'application/json');}
  function examBackupData(){return{version:'1.0',progress:read('examProgress',{}),attempts:read('examAttempts',[]),sessions:read('examSessions',[]),grade:read('examGrade','2')};}
  function cognitionBackupData(){return{version:'1.0',attempts:read('cognitionAttempts',[]),active:read('cognitionActive',null)};}
  function exportBackup(){exportFile('french-structure-lab-backup.json',JSON.stringify({format:'fsl-backup',schemaVersion:APP_VERSION,exportedAt:new Date().toISOString(),progress:state.progress,activity:state.activity,exercises:state.userQuestions,sentences:state.userSentences,events:state.events,sessions:state.sessions,activeSession:state.activeSession,fuzzy:state.fuzzy,readings:state.readings,level:state.level,exam:examBackupData(),cognition:cognitionBackupData()},null,2),'application/json');} 
  function exportAIReport(){const report=insights.exportForAI({questions:questionBank().map(q=>({...q,level:levelOf(q)})),progress:state.progress,events:state.events,sessions:state.sessions,fuzzy:state.fuzzy,level:state.level});report.futsuken=examBackupData();report.cognition=cognitionBackupData();exportFile('french-structure-lab-ai-report.json',JSON.stringify(report,null,2),'application/json');} 
  function exportHistoryCSV(){const rows=[['日時','イベント','レベル','問題ID','正誤','選択','正解','復習']];state.events.filter(x=>x.type==='answer').forEach(e=>rows.push([e.at,e.type,e.level,e.questionId,e.correct?'1':'0',String(e.choice),String(e.solution),e.review?'1':'0']));exportFile('french-study-history.csv','\ufeff'+rows.map(r=>r.map(csv).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
  function importBackup(raw){
    if(raw.length>3000000)throw Error(tx('バックアップが大きすぎます','Backup is too large'));
    const b=JSON.parse(raw);if(!b||b.format!=='fsl-backup'||!b.progress||typeof b.progress!=='object'||Array.isArray(b.progress)||!b.activity||typeof b.activity!=='object')throw Error(tx('学習バックアップではありません','Not a valid FSL backup'));
    if(!Array.isArray(b.exercises)||!Array.isArray(b.sentences)||!b.exercises.every(validateExercise)||!b.sentences.every(validateSentence))throw Error(tx('バックアップの教材データが不正です','Invalid lessons in backup'));
    for(const prop of ['events','sessions'])if(b[prop]!==undefined&&!Array.isArray(b[prop]))throw Error(tx('履歴データが不正です','Invalid history data'));
    if(!confirm(tx('現在の学習記録をこのバックアップで置き換えます。先に現在の記録を書き出しましたか？','Replace current study records with this backup? Consider exporting first.')))return;
    const fields={progress:b.progress,activity:b.activity,userQuestions:b.exercises,userSentences:b.sentences,events:(b.events||[]).slice(-10000),sessions:(b.sessions||[]).slice(-500),activeSession:null,fuzzy:b.fuzzy||{},readings:b.readings||{},level:validLevels.includes(b.level)?b.level:'B1'};
    if(b.exam!==undefined){
      const e=b.exam;
      if(!e||!e.progress||typeof e.progress!=='object'||Array.isArray(e.progress)||!Array.isArray(e.attempts)||!Array.isArray(e.sessions))throw Error(tx('仏検のバックアップ形式が不正です','Invalid exam backup data'));
    }
    if(b.cognition!==undefined){const c=b.cognition;if(!c||!Array.isArray(c.attempts)||(c.active!==null&&c.active!==undefined&&typeof c.active!=='object'))throw Error(tx('認知学習記録の形式が不正です','Invalid cognition learning history'));}
    Object.entries(fields).forEach(([k,v])=>{if(!save(k,v))throw Error(tx('保存に失敗しました','Save failed'));state[k]=v;});
    // Older backups have no exam section. In that case, preserve newer exam learning data.
    if(b.exam!==undefined){const e=b.exam;const extra={examProgress:e.progress,examAttempts:e.attempts.slice(-7500),examSessions:e.sessions.slice(-400),examGrade:['4','3','j2','2','j1','1'].includes(e.grade)?e.grade:'2',examActive:null};Object.entries(extra).forEach(([k,v])=>{if(!save(k,v))throw Error(tx('仏検記録を保存できません','Could not restore exam history'));});}

    if(b.cognition!==undefined){const c=b.cognition;if(!save('cognitionAttempts',c.attempts.slice(-1800))||!save('cognitionActive',c.active||null))throw Error(tx('認知学習記録を復元できません','Could not restore cognition history'));}
    toast(tx('バックアップを復元しました','Backup restored'));startSession('daily');
  }
  function validStr(x,max=2000){return typeof x==='string'&&x.trim().length>0&&x.length<=max;}
  function checkLength(x,max=500){return typeof x==='string'&&x.length<=max;}
  function validateExercise(x){
    return x && validStr(x.prompt,500) && validStr(x.sentence,500) && validStr(x.category,60) && Array.isArray(x.options) && x.options.length===4 && x.options.every(v=>validStr(v,150)) && Number.isInteger(x.answer)&& x.answer>=0&&x.answer<4 && ['ja','en','whyJa','whyEn'].every(k=>validStr(x[k],1800));
  }
  function validateSentence(x){return x && validStr(x.original,1000) && ['titleJa','titleEn','translationJa','translationEn','noteJa','noteEn'].every(k=>validStr(x[k],1800)) && Array.isArray(x.tokens)&& x.tokens.length>=1&&x.tokens.length<=100&&x.tokens.every(t=>t&&['text','lemma','roleJa','roleEn','detailJa','detailEn'].every(k=>validStr(t[k],500)));}
  function importJSON(raw){
    if(raw.length>600000)throw Error(tx('ファイルが大きすぎます（上限600KB）','File exceeds 600 KB'));
    let p;try{p=JSON.parse(raw);}catch{throw Error(tx('JSONの形式が不正です','Invalid JSON syntax'));}
    if(!p || p.schemaVersion!=='1.0' || p.language!=='fr')throw Error(tx('schemaVersion: "1.0", language: "fr" を指定してください','Use schemaVersion "1.0" and language "fr"'));
    const q=p.exercises??[], s=p.sentences??[];
    if(!Array.isArray(q)||!Array.isArray(s)||q.length+s.length===0||q.length+s.length>200)throw Error(tx('教材は合計1〜200件の配列にしてください','Provide 1–200 total items in arrays'));
    if(!q.every(validateExercise))throw Error(tx('問題に必須項目の不足・不正があります','An exercise has missing or invalid fields'));
    if(!s.every(validateSentence))throw Error(tx('文章分析データに必須項目の不足・不正があります','A sentence entry has missing or invalid fields'));
    const qs=state.userQuestions.slice(), ss=state.userSentences.slice();let countQ=0,countS=0;
    for(let i=0;i<q.length;i++){
      const x=q[i], id='custom-q-'+(validStr(x.id,100)?x.id.replace(/[^\w-]/g,'-'):String(i+1));
      const obj={id,level:validLevels.includes(x.level)?x.level:state.level,category:x.category,prompt:x.prompt,options:x.options,answer:x.answer,sentence:x.sentence,ja:x.ja,en:x.en,whyJa:x.whyJa,whyEn:x.whyEn};
      const pos=qs.findIndex(z=>z.id===id);if(pos<0){qs.push(obj);countQ++;}else qs[pos]=obj;
    }
    for(let i=0;i<s.length;i++){
      const x=s[i], id='custom-s-'+(validStr(x.id,100)?x.id.replace(/[^\w-]/g,'-'):String(i+1));
      const obj={id,titleJa:x.titleJa,titleEn:x.titleEn,original:x.original,translationJa:x.translationJa,translationEn:x.translationEn,noteJa:x.noteJa,noteEn:x.noteEn,tokens:x.tokens.map(t=>({text:t.text,lemma:t.lemma,roleJa:t.roleJa,roleEn:t.roleEn,detailJa:t.detailJa,detailEn:t.detailEn}))};
      const pos=ss.findIndex(z=>z.id===id);if(pos<0){ss.push(obj);countS++;}else ss[pos]=obj;
    }
    if(qs.length+ss.length>1000)throw Error(tx('教材件数の上限です','Library item limit reached'));
    if(!save('userQuestions',qs)||!save('userSentences',ss))throw Error(tx('保存できませんでした','Could not save your data'));
    state.userQuestions=qs;state.userSentences=ss;
    toast(tx(`問題${countQ}件・分析文${countS}件を追加しました`,`Added ${countQ} questions and ${countS} sentences`));
    renderLibrary();
  }
  async function copyText(t){try{await navigator.clipboard.writeText(t);toast(tx('コピーしました','Copied'));}catch{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(tx('コピーしました','Copied'));}catch{toast(tx('コピーできませんでした','Could not copy'));}ta.remove();}}
  document.querySelectorAll('.nav-tab').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('#fontSizeButton').addEventListener('click',()=>{state.largeText=!state.largeText;save('largeText',state.largeText);render();});
  $('#languageSelect').addEventListener('change',ev=>{if(!FSL_LANG.set(ev.target.value))return;state.lang=FSL_LANG.get();render();});
  $('#levelSelect').addEventListener('change',e=>{if(!validLevels.includes(e.target.value))return;const level=e.target.value;if(state.activeSession)finishSession(false);state.level=level;save('level',state.level);const u=levelUnits()[0];if(u){state.selectedUnit=u.id;save('unit',u.id);}setView('courses');});
  $('#content').addEventListener('click',e=>{
    const option=e.target.closest('[data-answer]');
    if(option && state.sessionAnswer===null){const q=questionById(state.session[state.sessionIndex]);if(!q)return;state.sessionAnswer=Number(option.dataset.answer);markAnswer(q,state.sessionAnswer===q.answer);renderToday();return;}
    const lc=e.target.closest('[data-level]');if(lc){if(state.activeSession){finishSession(false);}state.level=lc.dataset.level;save('level',state.level);const u=levelUnits()[0];if(u){state.selectedUnit=u.id;save('unit',u.id);}renderCourses();updateHeader();return;}
    const uc=e.target.closest('[data-unit]');if(uc){state.selectedUnit=uc.dataset.unit;save('unit',state.selectedUnit);renderCourses();return;}
    const sb=e.target.closest('[data-sentence]');if(sb){state.selectedSentence=sb.dataset.sentence;state.selectedToken=0;renderAnalysis();return;}
    const tb=e.target.closest('[data-token]');if(tb){state.selectedToken=Number(tb.dataset.token);record('word_touch',{sentenceId:state.selectedSentence,tokenIndex:state.selectedToken});renderAnalysis();return;}
    const sf=e.target.closest('[data-speak-form]');if(sf){const v=FSL_DATA.verbs.find(v=>v.id===state.selectedVerb);const f=conjugation(v,state.selectedTense)[Number(sf.dataset.speakForm)];speak(personForm(persons[Number(sf.dataset.speakForm)],f,state.selectedTense));return;}
    const fid=e.target.closest('[data-focus-id]');if(fid){const q=questionById(fid.dataset.focusId);if(q){state.level=levelOf(q);save('level',state.level);startAt('focus',[q.id]);}return;}
    const ft=e.target.closest('[data-focus-topic]');if(ft){const ids=distributed(levelQuestions().filter(q=>q.category===ft.dataset.focusTopic)).slice(0,10).map(q=>q.id);if(ids.length)startAt('topic',ids);else toast(tx('このレベルに対象問題がありません','No matching questions at this level'));return;}
    const b=e.target.closest('[data-action]');if(!b)return;
    switch(b.dataset.action){
      case 'next-question':state.sessionIndex++;state.sessionAnswer=null;if(state.activeSession){state.activeSession.index=state.sessionIndex;state.activeSession.answer=null;save('activeSession',state.activeSession);}renderToday();break;
      case 'finish-session':finishSession();break;
      case 'end-early':finishSession();break;
      case 'toggle-fuzzy':{const q=questionById(state.session[state.sessionIndex]);if(!q)return;state.fuzzy[q.id]=!state.fuzzy[q.id];save('fuzzy',state.fuzzy);record('fuzzy_changed',{questionId:q.id,unclear:state.fuzzy[q.id]});renderToday();break;}
      case 'start-quick':startAt('quick',distributed(levelQuestions()).slice(0,3).map(q=>q.id));break;
      case 'start-unit':{const u=FSL_CURRICULUM.units.find(x=>x.id===state.selectedUnit);if(u){state.level=u.level;save('level',u.level);startAt('unit',u.items.map(q=>q.id));}break;}
      case 'read-complete':{const u=FSL_CURRICULUM.units.find(x=>x.id===state.selectedUnit);if(!u)break;state.readings[u.id]={count:(state.readings[u.id]?.count||0)+1,last:new Date().toISOString()};save('readings',state.readings);record('reading_completed',{unitId:u.id});renderCourses();break;}
      case 'listen-reading':{const u=FSL_CURRICULUM.units.find(x=>x.id===state.selectedUnit);if(u){speak(u.reading);record('listened',{unitId:u.id});}break;}
      case 'export-history':exportHistoryCSV();break;
      case 'export-ai-report':exportAIReport();break;
      case 'save-reflection':{const a=state.sessions.at(-1);if(a){a.reflection=($('#reflectionInput')?.value||'').slice(0,1000);save('sessions',state.sessions);record('reflection_saved',{sessionId:a.id});toast(tx('振り返りを保存しました','Reflection saved'));renderRecords();}break;}
      case 'skip-question':record('skip',{questionId:state.session[state.sessionIndex]});if(state.activeSession)state.activeSession.skipped++;state.sessionIndex++;state.sessionAnswer=null;if(state.activeSession){state.activeSession.index=state.sessionIndex;state.activeSession.answer=null;save('activeSession',state.activeSession);}renderToday();break;
      case 'start-daily':startSession('daily');break;
      case 'start-review':startSession('review');break;
      case 'view-analysis':setView('analysis');break;
      case 'next-sentence':{const arr=sentenceBank();const idx=arr.findIndex(s=>s.id===state.selectedSentence);state.selectedSentence=arr[(idx+1)%arr.length].id;state.selectedToken=0;renderAnalysis();break;}
      case 'speak-question':{const q=questionById(state.session[state.sessionIndex]);if(q){speak(q.sentence);record('audio_played',{questionId:q.id});}break;}
      case 'speak-sentence':{const s=sentenceBank().find(s=>s.id===state.selectedSentence);if(s){speak(s.original);record('audio_played',{sentenceId:s.id});}break;}
      case 'export-anki':exportAnki();break;
      case 'export-cards':exportCards();break;
      case 'export-backup':exportBackup();break;
      case 'copy-prompt':copyText(promptAI);break;
      case 'insert-sample':$('#jsonInput').value=JSON.stringify(sampleJSON,null,2);toast(tx('例を入力しました','Example inserted'));break;
      case 'download-sample':exportFile('fsl-sample.json',JSON.stringify(sampleJSON,null,2),'application/json');break;
      case 'import-json':try{importJSON($('#jsonInput').value.trim());}catch(err){toast(err.message);}break;
    }
  });
  $('#content').addEventListener('change',e=>{
    if(e.target.id==='unitSelect'){state.selectedUnit=e.target.value;save('unit',state.selectedUnit);renderCourses();return;}
    if(e.target.id==='durationSelect'){state.targetMinutes=Number(e.target.value)||15;save('targetMinutes',state.targetMinutes);return;}
    if(e.target.id==='backupFile'){const f=e.target.files?.[0];if(!f)return;f.text().then(importBackup).catch(err=>toast(err.message));return;}
    if(e.target.id==='verbSelect'){state.selectedVerb=e.target.value;renderVerbs();}
    if(e.target.id==='tenseSelect'){state.selectedTense=e.target.value;renderVerbs();}
    if(e.target.id==='jsonFile'){
      const f=e.target.files?.[0]; if(!f)return;
      if(f.size>600000){toast(tx('600KB以下のJSONを使用してください','Choose JSON under 600 KB'));return;}
      const reader=new FileReader();reader.onload=()=>{try{importJSON(String(reader.result));}catch(err){toast(err.message);}};reader.onerror=()=>toast(tx('ファイルを読めませんでした','Could not read file'));reader.readAsText(f);
    }
  });
  if('serviceWorker' in navigator && location.protocol!=='file:') window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  if(resumeSession())setView('today');else startSession('daily');
})();
