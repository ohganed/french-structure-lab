'use strict';
/* French Structure Lab — learner-led insights v0.3
   Evidence is drawn from actual local answers; no CEFR proficiency claim.
   This file contains pure calculations and never writes learner data.
*/
(function(root){
  function list(x){return Array.isArray(x)?x:[]}
  function records(events){return list(events).filter(e=>e&&e.type==='answer'&&typeof e.questionId==='string').slice().sort((a,b)=>String(a.at||'').localeCompare(String(b.at||'')))}
  function mapById(events){const out={};records(events).forEach(e=>(out[e.questionId]||(out[e.questionId]=[])).push(e));return out}
  function topicStats(events, questions, level){
    const ids=new Set(list(questions).filter(q=>q.level===level).map(q=>q.id));
    const m={};records(events).filter(e=>e.level===level&&ids.has(e.questionId)).forEach(e=>{
      const k=e.category||'Other',v=m[k]||(m[k]={topic:k,attempts:0,wrong:0,right:0,recovered:0,questionIds:new Set(),last:''});
      v.attempts++;v.wrong+=Number(!e.correct);v.right+=Number(!!e.correct);v.questionIds.add(e.questionId);v.last=e.at||v.last;
    });
    const rows=Object.values(m).map(x=>({...x,questionIds:[...x.questionIds],missRate:x.attempts?Math.round(x.wrong/x.attempts*100):0}));
    return rows.sort((a,b)=>(b.wrong*2+b.missRate/100)-(a.wrong*2+a.missRate/100)||a.topic.localeCompare(b.topic));
  }
  function timeline(events, questions, progress, fuzzy, level){
    const by=mapById(events),valid=list(questions).filter(q=>q.level===level);const out=[];
    valid.forEach(q=>{
      const attempts=by[q.id]||[];const p=(progress||{})[q.id]||{};
      if(!attempts.length&&!p.attempts&&!(fuzzy||{})[q.id])return;
      const wrong=attempts.filter(e=>!e.correct).length;
      const recovered=attempts.some((e,i)=>!!e.correct&&attempts.slice(0,i).some(prev=>!prev.correct));
      const last=attempts[attempts.length-1];
      out.push({id:q.id,level:q.level,category:q.category,sentence:q.sentence,attempts:attempts.length||p.attempts||0,wrong,
        recovered,flagged:!!(fuzzy||{})[q.id],lastCorrect:last?!!last.correct:(typeof p.lastCorrect==='boolean'?p.lastCorrect:null),
        due:p.due||null,history:attempts.slice(-8).map(e=>({at:e.at,correct:!!e.correct}))});
    });
    return out.sort((a,b)=>Number(b.flagged)-Number(a.flagged)||Number(!b.lastCorrect)-Number(!a.lastCorrect)||b.wrong-a.wrong||b.attempts-a.attempts)
  }
  function nextPlan(events, questions, progress, fuzzy, level, today, limit=8){
    const by=mapById(events);const out=list(questions).filter(q=>q.level===level).map(q=>{
      const p=(progress||{})[q.id],history=by[q.id]||[],flag=!!(fuzzy||{})[q.id];
      let reason,priority;
      if(p?.due&&p.due<=today){reason='due';priority=0}
      else if(flag){reason='flagged';priority=1}
      else if(p?.lastCorrect===false){reason='retry';priority=2}
      else if(!p?.attempts){reason='new';priority=3}
      else {reason='strengthen';priority=4}
      const last=history[history.length-1];return {id:q.id,reason,priority,category:q.category,sentence:q.sentence,due:p?.due||null,wrong:history.filter(x=>!x.correct).length,lastCorrect:last?.correct??p?.lastCorrect??null};
    });
    return out.sort((a,b)=>a.priority-b.priority||b.wrong-a.wrong||String(a.due||'').localeCompare(String(b.due||''))||a.id.localeCompare(b.id)).slice(0,Math.max(1,limit))
  }
  function sessionReview(active, events, questions, progress, fuzzy, today){
    const answers=records(events).filter(e=>e.sessionId===active.id);
    const lookup=new Map(list(questions).map(q=>[q.id,q]));
    const mistakes=answers.filter(e=>!e.correct),byTopic={};
    mistakes.forEach(e=>{const key=e.category||'Other';byTopic[key]=(byTopic[key]||0)+1});
    const weakTopics=Object.entries(byTopic).sort((a,b)=>b[1]-a[1]).map(([topic,count])=>({topic,count}));
    const attempted=new Set(answers.map(e=>e.questionId));
    const exact=list(active.questionIds).filter(id=>attempted.has(id)).length;
    const next=nextPlan(events,questions,progress,fuzzy,active.level,today,6).map(x=>({id:x.id,reason:x.reason}));
    return {version:1,basedOn:'answer-events',answerCount:answers.length,uniqueQuestions:exact,
      correctCount:answers.filter(e=>e.correct).length,weakTopics,wrongQuestionIds:[...new Set(mistakes.map(x=>x.questionId))].filter(id=>lookup.has(id)),
      suggestedNext:next,createdAt:new Date().toISOString()};
  }
  function exportForAI(opts){
    const qs=list(opts.questions),ev=records(opts.events),map=new Map(qs.map(q=>[q.id,q]));
    const by=mapById(ev),studied=qs.filter(q=>by[q.id]?.length||(opts.progress||{})[q.id]?.attempts);
    const relevant=studied.map(q=>({id:q.id,level:q.level,category:q.category,prompt:q.prompt,modelAnswer:q.sentence,
      explanationJa:q.whyJa,explanationEn:q.whyEn,progress:(opts.progress||{})[q.id]||null,
      flagged:!!(opts.fuzzy||{})[q.id],attempts:list(by[q.id]).map(e=>({at:e.at,correct:!!e.correct,selectedOptionIndex:e.choice,answerOptionIndex:e.solution,review:!!e.review}))}));
    const sessions=list(opts.sessions).map(s=>({id:s.id,level:s.level,mode:s.mode,startedAt:s.startedAt,endedAt:s.endedAt,
      attempts:s.attempts,correct:s.correct,skipped:s.skipped,activeMsEstimate:s.activeMs,reflection:s.reflection||'',analysis:s.analysis||null}));
    return {format:'fsl-ai-learning-report',schemaVersion:'1.0',createdAt:new Date().toISOString(),language:'fr',
      description:'User-owned study history for evidence-based external AI analysis. Correctness is not a CEFR level certification. Active time is an estimate.',
      selectedLevel:opts.level,availableLevels:['A1','A2','B1','B2','C1','C2'],
      summary:{totalDetailedAnswers:ev.length,completedSessions:sessions.length,studiedQuestionCount:studied.length,
        note:'Earlier versions may have aggregate item progress without detailed answer events.'},
      questions:relevant,sessions};
  }
  root.FSL_INSIGHTS=Object.freeze({version:'0.3',records,topicStats,timeline,nextPlan,sessionReview,exportForAI});
})(window);
