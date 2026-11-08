/* French Structure Lab: expanded, hand-authored A1-C2 curriculum v1.1.
 * 36 new units; existing unit/question IDs remain stable. */
"use strict";
(function(){
  const original=FSL_CURRICULUM;
  const packs=window.FSL_COURSE_PACKS;
  if(!original||!Array.isArray(original.units)||!Array.isArray(original.questions)||!Array.isArray(packs))
    throw new Error("Course expansion dependencies missing");
  const levels=["A1","A2","B1","B2","C1","C2"];
  const oldIds=new Set(original.units.map(u=>u.id));
  const questions=new Set(original.questions.map(q=>q.id));
  const additions=[];
  const unpack=(record)=>{
    const {id,tj,te,gj,ge,r,rj,re,fj,fe,g,q}=record;
    const level=id.split("-")[0].toUpperCase();
    if(!levels.includes(level)||!id||oldIds.has(id)||!Array.isArray(g)||g.length!==7||!Array.isArray(q)||q.length!==4)
      throw new Error("Invalid or duplicate course unit: "+id);
    const items=q.map((tuple,i)=>{
      if(!Array.isArray(tuple)||tuple.length!==6)throw new Error("Missing exercise fields: "+id+" q"+(i+1));
      const [prompt,options,answer,sentence,whyJa,whyEn]=tuple;
      if(!options||options.length!==4||new Set(options).size!==4||!Number.isInteger(answer)||answer<0||answer>3)
        throw new Error("Invalid options or correct index: "+id+" q"+(i+1));
      const questionId=id+"-q"+(i+1);
      if(questions.has(questionId))throw new Error("Duplicate question: "+questionId);
      if(!prompt.includes("___")||!sentence||!whyJa||!whyEn)throw new Error("Incomplete exercise: "+questionId);
      questions.add(questionId);
      return {id:questionId,level,unit:id,category:tj,prompt,options,answer,sentence,
        ja:"文の意味と構造を確かめながら形を選びましょう。",
        en:"Choose the form by meaning and sentence structure.",
        whyJa,whyEn};
    });
    const guide={logicFr:g[0],logicJa:g[1],logicEn:g[2],contrastFr:g[3],contrastJa:g[4],taskFr:g[5],taskJa:g[6],taskEn:ge};
    if(![tj,te,gj,ge,r,rj,re,fj,fe].every(v=>typeof v==="string"&&v.trim().length>=4)||
      r.trim().length<30||!Object.values(guide).every(v=>typeof v==="string"&&v.trim().length>=4))
      throw new Error("Incomplete readings or explanations in "+id);
    oldIds.add(id);
    return {id,level,titleJa:tj,titleEn:te,goalJa:gj,goalEn:ge,reading:r,
      translationJa:rj,translationEn:re,focusJa:fj,focusEn:fe,guide,items};
  };
  for(const unit of packs)additions.push(unpack(unit));
  const expected={A1:6,A2:6,B1:6,B2:6,C1:6,C2:6};
  for(const l of levels){
    const count=additions.filter(u=>u.level===l).length;
    if(count!==expected[l])throw new Error("Course units "+l+" expected "+expected[l]+" got "+count);
  }
  if(additions.length!==36||questions.size!==original.questions.length+144)
    throw new Error("Course question count mismatch");
  original.units.push(...additions);
  original.questions.push(...additions.flatMap(u=>u.items));
  // Core units get the same learning path without rewriting their existing texts.
  for(const u of original.units){
    if(u.guide)continue;
    u.guide={
      logicJa:u.focusJa,logicEn:u.focusEn,
      logicFr:"Repère le sujet, le verbe et les compléments. Quelle forme exprime le sens de cette scène ?",
      contrastFr:u.items.slice(0,2).map(q=>q.sentence).join(" / "),
      contrastJa:"二つの例文の主語・動詞・補語を比べ、変わった部分を説明します。",
      taskFr:"Change le sujet ou la situation d’un exemple, puis explique le choix de la forme.",
      taskJa:"例文の主語や状況を変え、文法形式がどう変わるか自分の文で確かめましょう。",
      taskEn:"Change the subject or scenario and explain any changes to the grammar."
    };
  }
  const titlesFr={"a1-greetings":"Se présenter avec être","a1-cafe":"Commander au café","a1-schedule":"Routines et heures","a1-family":"La famille et les possessifs","a1-place":"Lieux et existence","a1-food":"Manger et boire : du, de la, de l’","a1-questions":"Poser des questions","a1-adjectives":"Accorder les adjectifs","a1-plans":"Futur proche et impératif","a2-past":"Passé composé et imparfait","a2-plans":"Projets et comparaisons","a2-experiences":"Parler de ses expériences","a2-invite":"Inviter et proposer","a2-transport":"Demander son chemin","a2-recents":"Passé récent et futur proche","a2-health":"Santé et verbes pronominaux","a2-pronouns":"Les pronoms compléments","a2-narrative":"Raconter des événements","b1-relative":"Relatives : qui, que, dont et où","b1-hypothesis":"Hypothèses et politesse","b1-necessity":"Nécessité et subjonctif","b1-causality":"Cause, but et conséquence","b1-anteriority":"Le plus-que-parfait","b1-objectorder":"Les pronoms au passé composé","b1-reported":"Rapporter des paroles","b1-passive":"La voix passive","b1-discussion":"Développer une opinion","b2-reported":"Le discours indirect","b2-argument":"Construire un argument","b2-precision":"Précision grammaticale","b2-counterfactual":"Les hypothèses irréelles du passé","b2-concession":"Concession et opposition","b2-reports":"La concordance des temps","b2-stance":"Certitude, doute et mode","b2-nominal":"Nominalisation et cohésion","b2-debate":"Nuancer un argument","c1-caution":"Affirmations et prudence","c1-register":"Nuances et registres","c1-logic":"Relations logiques complexes","c1-relative-complex":"Relatives et prépositions","c1-evidence":"Sources et degrés de certitude","c1-anaphora":"Références et cohésion du texte","c1-register-shift":"Changer de registre","c1-inference":"Implicite et présupposés","c1-mediation":"Résumer des points de vue","c2-implication":"Interpréter les sous-entendus","c2-style":"Style et effet de sens","c2-argument":"Argumentation avancée","c2-expletive":"Ne explétif et négation","c2-concession":"Concessions élaborées","c2-logic":"Conditions nécessaires et suffisantes","c2-scope":"Portée de la négation","c2-rhetoric":"Rhétorique et précision","c2-paraphrase":"Reformuler sans déformer"};
  const levelTextFr={"A1":["Communiquer dans des situations simples","Se présenter, demander et décrire des choses familières."],"A2":["Échanger dans la vie quotidienne","Raconter des expériences et gérer des situations courantes."],"B1":["Raconter et expliquer","Relier les événements, exprimer une opinion et justifier ses choix."],"B2":["Argumenter et nuancer","Développer une analyse avec hypothèses, concessions et preuves."],"C1":["Interpréter les nuances","Analyser les implicites, les sources et les registres."],"C2":["Maîtriser les effets du discours","Préciser le raisonnement, la portée et les reformulations."]};
  for(const u of original.units){
    if(!titlesFr[u.id])throw new Error("Missing French course title: "+u.id);
    u.titleFr=titlesFr[u.id];
  }
  for(const [level,values] of Object.entries(levelTextFr)){
    original.levels[level].fr=values[0];
    original.levels[level].descFr=values[1];
  }
  window.FSL_COURSE_EXPANSION={
    version:"1.1",addedUnits:additions.length,addedQuestions:additions.reduce((n,u)=>n+u.items.length,0),
    totals:{units:original.units.length,courseQuestions:original.questions.length}
  };
  delete window.FSL_COURSE_PACKS;
})();