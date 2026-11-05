/* French Structure Lab — original CEFR-inspired starter curriculum.
   CEFR levels describe communicative proficiency, not a guarantee of certification. */
'use strict';
const FSL_CURRICULUM = (() => {
  const E=(prompt,options,answer,sentence,ja,en,whyJa,whyEn)=>({prompt,options,answer,sentence,ja,en,whyJa,whyEn});
  const U=(level,id,titleJa,titleEn,goalJa,goalEn,reading,translationJa,translationEn,focusJa,focusEn,items)=>({level,id,titleJa,titleEn,goalJa,goalEn,reading,translationJa,translationEn,focusJa,focusEn,items:items.map((e,i)=>({...e,id:`${id}-q${i+1}`,level,unit:id,category:titleJa}))});
  const levels={
    A1:{ja:'身近なことを伝える',en:'Everyday basics',descJa:'自己紹介、現在形、冠詞、質問、身近な買い物。',descEn:'Introduce yourself, use the present, ask questions and shop.'},
    A2:{ja:'過去と予定を話す',en:'Past and plans',descJa:'複合過去、半過去、比較、代名詞、予定の説明。',descEn:'Describe experiences and plans with past tenses, comparison and pronouns.'},
    B1:{ja:'経験と意見をつなぐ',en:'Narrate and explain',descJa:'関係代名詞、条件法、接続法の導入、理由と体験談。',descEn:'Connect narratives and express opinions with subordinate clauses.'},
    B2:{ja:'根拠をもって議論する',en:'Argue and qualify',descJa:'論証、仮定、譲歩、間接話法、精密な文法。',descEn:'Build arguments, qualify claims, and handle complex structures.'},
    C1:{ja:'含意と立場を読み解く',en:'Nuance and register',descJa:'書き言葉、複雑な論理、語用論、解釈の差異。',descEn:'Interpret nuanced arguments, register and complex discourse.'},
    C2:{ja:'高度な表現を精密に扱う',en:'Precision and style',descJa:'皮肉・婉曲・曖昧性・文体の選択と再表現。',descEn:'Work with subtle implications, ambiguity, irony and stylistic control.'}
  };
  const units=[
    U('A1','a1-greetings','自己紹介と être','Introducing yourself', '名前・職業・出身を現在形で言う','Introduce yourself with être and simple clauses',
      'Bonjour ! Je m’appelle Léa. Je suis étudiante. J’habite à Lyon.',
      'こんにちは！私はレアです。学生です。リヨンに住んでいます。','Hello! My name is Léa. I am a student. I live in Lyon.',
      'je suis / tu es / il est。主語に合わせて être の形を選びます。','Être changes with the subject: je suis, tu es, il est.',[
      E('Je ___ étudiante.',['suis','es','est','sommes'],0,'Je suis étudiante.','私は学生です。','I am a student.','主語 je に対する être の現在形は suis。','Je takes suis in the present of être.'),
      E('Tu ___ français ?',['parle','parles','parlons','parlez'],1,'Tu parles français ?','あなたはフランス語を話しますか。','Do you speak French?','規則 -er 動詞の tu 形は -es。','Regular -er verbs take -es with tu.'),
      E('Elle ___ à Paris.',['habite','habites','habitons','habitez'],0,'Elle habite à Paris.','彼女はパリに住んでいます。','She lives in Paris.','elle に対応する habiter の語尾は -e。','Elle takes habite (third-person singular).'),
      E('Nous ___ japonais.',['êtes','sommes','sont','suis'],1,'Nous sommes japonais.','私たちは日本人です。','We are Japanese.','être の nous 形は sommes。','Nous sommes is the first-person plural form of être.')]),
    U('A1','a1-cafe','カフェで注文する','At a café','冠詞と丁寧な注文を使う','Use articles and polite requests',
      'Au café, Hugo commande un thé. Il demande aussi une tarte. La serveuse sourit.',
      'カフェでユーゴーはお茶を注文します。タルトも頼みます。店員はほほえみます。','At the café, Hugo orders tea and also asks for a tart. The waitress smiles.',
      'un / une は名詞の性に応じて選びます。丁寧な注文には je voudrais が使えます。','Un/une agree with noun gender; je voudrais makes a polite request.',[
      E('Je voudrais ___ café, s’il vous plaît.',['un','une','des','la'],0,'Je voudrais un café, s’il vous plaît.','コーヒーを一杯ください。','I would like a coffee, please.','café は男性名詞の単数。新たな一杯には un。','Café is masculine singular; use un.'),
      E('Elle commande ___ salade.',['un','une','du','des'],1,'Elle commande une salade.','彼女はサラダを注文します。','She orders a salad.','salade は女性名詞の単数なので une。','Salade is feminine singular: une.'),
      E('Vous ___ un thé ?',['voulez','veut','voulons','veux'],0,'Vous voulez un thé ?','お茶はいかがですか。','Would you like tea?','vouloir の vous 形は voulez。','Vouloir takes voulez with vous.'),
      E('La serveuse ___ gentille.',['sont','est','es','êtes'],1,'La serveuse est gentille.','その女性店員は親切です。','The waitress is kind.','単数の主語は est。形容詞 gentille は女性単数形。','Singular subject takes est; gentille is feminine singular.')]),
    U('A1','a1-schedule','日常と時間','Daily routines','否定、頻度、基本的な時間表現を使う','Use negation, frequency and everyday time expressions',
      'Tous les matins, je prends le bus à huit heures. Le dimanche, je ne travaille pas.',
      '毎朝8時にバスに乗ります。日曜日は働きません。','Every morning I take the bus at eight. On Sundays I do not work.',
      'ne ... pas は動詞を挟みます。習慣には現在形を使います。','Ne ... pas surrounds a finite verb; the present describes habits.',[
      E('Je ne ___ pas le samedi.',['travailles','travaille','travaillez','travaillons'],1,'Je ne travaille pas le samedi.','土曜日には働きません。','I do not work on Saturdays.','ne + travaille + pas。主語 je は -e。','Ne ... pas surrounds travaille; je takes -e.'),
      E('Nous ___ le train tous les jours.',['prends','prend','prenons','prenez'],2,'Nous prenons le train tous les jours.','私たちは毎日電車に乗ります。','We take the train every day.','prendre の nous 形は prenons。','The nous form of prendre is prenons.'),
      E('Il est ___ heures.',['trois','troisième','troisièmes','troisièmement'],0,'Il est trois heures.','3時です。','It is three o’clock.','時刻は数字 + heure(s)。trois は基数。','Clock time uses a cardinal number: trois heures.'),
      E('___ vas-tu ? — À l’école.',['Quand','Où','Pourquoi','Combien'],1,'Où vas-tu ? — À l’école.','どこへ行きますか。―学校へ。','Where are you going? — To school.','行き先を尋ねる疑問詞は où。','Où asks about a destination.')]),
    U('A2','a2-past','出来事を語る','Past events','複合過去と半過去を使い分ける','Distinguish completed events and past background',
      'Hier, il pleuvait quand je suis sorti. J’ai pris mon parapluie et j’ai couru à la gare.',
      '昨日、私が外に出たとき雨が降っていました。傘を持って駅へ走りました。','Yesterday it was raining when I went out. I took my umbrella and ran to the station.',
      '背景・進行には半過去、出来事の連続には複合過去を使います。','Use imparfait for background; passé composé for bounded events.',[
      E('Hier, nous ___ un film.',['regardons','avons regardé','regardions','regarderons'],1,'Hier, nous avons regardé un film.','昨日、私たちは映画を見ました。','Yesterday we watched a film.','昨日の一回の完結した行為は複合過去。','A bounded completed event uses passé composé.'),
      E('Quand j’étais petit, je ___ souvent ici.',['jouais','ai joué','joue','jouerai'],0,'Quand j’étais petit, je jouais souvent ici.','子どもの頃はよくここで遊びました。','When I was little, I often played here.','過去の習慣は半過去。','Habitual past actions normally take imparfait.'),
      E('Marie ___ arrivée à midi.',['a','est','va','avait'],1,'Marie est arrivée à midi.','マリーは正午に到着しました。','Marie arrived at noon.','arriver は複合過去で être を用います。','Arriver takes être in the passé composé.'),
      E('Je lisais quand tu ___.',['téléphones','as téléphoné','téléphonais','téléphoneras'],1,'Je lisais quand tu as téléphoné.','あなたが電話したとき私は読書していました。','I was reading when you called.','進行中の読書が背景、電話が区切りのある出来事。','Reading is background; the call is the interrupting event.')]),
    U('A2','a2-plans','予定と比較','Plans and comparisons','近接未来・比較級・目的語代名詞を扱う','Discuss plans, comparisons and objects',
      'Demain, nous allons visiter Annecy. Ce sera plus calme que Paris. J’y vais avec mon frère.',
      '明日アヌシーを訪れる予定です。パリより静かでしょう。弟とそこへ行きます。','Tomorrow we are going to visit Annecy. It will be quieter than Paris. I am going there with my brother.',
      'aller + 不定詞は近い未来。plus ... que は比較、y は場所を受けます。','Aller + infinitive gives a near future; plus ... que compares; y replaces a place.',[
      E('Nous allons ___ le musée demain.',['visité','visiter','visitons','visitions'],1,'Nous allons visiter le musée demain.','明日美術館を見学する予定です。','We are going to visit the museum tomorrow.','aller + 不定詞。','Aller is followed by an infinitive.'),
      E('Mon vélo est ___ rapide que le tien.',['plus','très','beaucoup','assez'],0,'Mon vélo est plus rapide que le tien.','私の自転車は君のより速いです。','My bicycle is faster than yours.','比較級は plus + 形容詞 + que。','Comparative form: plus + adjective + que.'),
      E('Tu vas au marché ? — Oui, j’___ vais.',['en','y','le','lui'],1,'Tu vas au marché ? — Oui, j’y vais.','市場へ行くの？―はい、行きます。','Going to the market? — Yes, I am.','à + 場所の代わりに y を使います。','Y replaces a place introduced by à.'),
      E('Elle ___ acheter du pain.',['va','vais','allons','allez'],0,'Elle va acheter du pain.','彼女はパンを買うつもりです。','She is going to buy bread.','elle の aller 現在は va。','Elle takes va in the present of aller.')]),
    U('A2','a2-experiences','経験を伝える','Personal experiences','期間・数量・好みを正しく言う','Talk about duration, quantity and preferences',
      'J’habite ici depuis deux ans. J’aime ce quartier, mais je n’ai jamais visité le château.',
      'ここに2年前から住んでいます。この地区は好きですが、城には一度も行ったことがありません。','I have lived here for two years. I like this district, but I have never visited the castle.',
      'depuis + 期間 は現在も続く状態。ne ... jamais で「一度も〜ない」。','Present + depuis denotes duration continuing now; ne ... jamais means never.',[
      E('J’habite à Nice ___ deux ans.',['pendant','depuis','dans','il y a'],1,'J’habite à Nice depuis deux ans.','私は2年前からニースに住んでいます。','I have been living in Nice for two years.','現在まで続く期間は depuis。','Depuis indicates a period continuing to the present.'),
      E('Je n’ai ___ visité ce château.',['toujours','jamais','encore','souvent'],1,'Je n’ai jamais visité ce château.','私はこの城を一度も訪れたことがありません。','I have never visited this castle.','ne ... jamais が「一度もない」。','Ne ... jamais means never.'),
      E('Tu veux des pommes ? — Oui, j’___ veux trois.',['y','en','les','leur'],1,'Tu veux des pommes ? — Oui, j’en veux trois.','リンゴが欲しい？―うん、3つ欲しい。','Want some apples? — Yes, I want three.','数量が残る場合、名詞句は en に置き換えます。','En replaces a quantity noun phrase while trois remains.'),
      E('J’ai commencé ce travail ___ cinq mois.',['depuis','dans','il y a','pendant'],2,'J’ai commencé ce travail il y a cinq mois.','5か月前にこの仕事を始めました。','I started this job five months ago.','過去の開始点を「〜前に」と置くのは il y a。','Il y a locates the beginning at a time in the past.')]),
    U('B1','b1-relative','関係節で説明する','Relative clauses','qui/que/dont/ où を根拠とともに選ぶ','Choose relative pronouns by their syntactic role',
      'Le livre dont je t’ai parlé se trouve à la bibliothèque où nous travaillons.',
      'あなたに話した本は、私たちが勉強している図書館にあります。','The book I told you about is at the library where we study.',
      '関係詞の選択は先行詞ではなく、関係節の中での働きで決まります。','Choose a relative pronoun by its role inside the relative clause.',[
      E('Voici le roman ___ tu m’as conseillé.',['qui','que','dont','où'],1,'Voici le roman que tu m’as conseillé.','これがあなたが勧めてくれた小説です。','Here is the novel you recommended to me.','conseiller quelque chose は直接目的語。que。','The novel is the direct object of conseiller: que.'),
      E('C’est une ville ___ j’aimerais vivre.',['qui','que','où','dont'],2,'C’est une ville où j’aimerais vivre.','ここは私が住んでみたい街です。','This is a city where I would like to live.','住む場所を表すので où。','Où refers to the place where one would live.'),
      E('Je connais l’artiste ___ travaille ici.',['que','qui','dont','où'],1,'Je connais l’artiste qui travaille ici.','私はここで働いている芸術家を知っています。','I know the artist who works here.','関係節 travaille の主語は qui。','Qui is subject of travaille in the relative clause.'),
      E('C’est le sujet ___ nous avons parlé.',['que','dont','où','qui'],1,'C’est le sujet dont nous avons parlé.','これが私たちの話した話題です。','This is the subject we talked about.','parler de + 話題。de を受ける dont。','Parler de requires dont for the de-complement.')]),
    U('B1','b1-hypothesis','仮定と丁寧な依頼','Hypotheses and requests','si 節と条件法、丁寧な願望を区別する','Contrast real conditions with hypotheticals',
      'Si j’avais plus de temps, je lirais davantage. Pourriez-vous me conseiller un roman ?',
      '時間がもっとあれば、もっと読むのですが。小説を一冊勧めていただけますか。','If I had more time, I would read more. Could you recommend a novel?',
      '現実と離れた仮定は si + 半過去 → 条件法現在。丁寧な依頼にも条件法が現れます。','Hypothetical si + imparfait pairs with conditional; conditional also softens requests.',[
      E('Si j’avais une voiture, j’___ à la mer.',['vais','irai','irais','allais'],2,'Si j’avais une voiture, j’irais à la mer.','車があれば海へ行くのですが。','If I had a car, I would go to the sea.','si + 半過去なら主節は条件法現在。','Si + imparfait pairs with present conditional.'),
      E('Si tu viens demain, nous ___ ensemble.',['déjeunerions','déjeunons','déjeunerons','déjeunions'],2,'Si tu viens demain, nous déjeunerons ensemble.','明日来たら一緒に昼食をとろう。','If you come tomorrow, we will have lunch together.','実現可能な未来は si + 現在、主節は未来形。','Real future: si + present; future in main clause.'),
      E('___-vous répéter, s’il vous plaît ?',['Pouvez','Pourriez','Pouviez','Puissiez'],1,'Pourriez-vous répéter, s’il vous plaît ?','繰り返していただけますか。','Could you repeat, please?','より丁寧な依頼の条件法 pourriez。','Pourriez is a conditional form used for polite requests.'),
      E('À ta place, je ___ le train.',['prendrai','prends','prendrais','prenais'],2,'À ta place, je prendrais le train.','私なら電車に乗るでしょう。','In your place, I would take the train.','仮定の助言を条件法で述べます。','The conditional expresses hypothetical advice.')]),
    U('B1','b1-necessity','義務と意見','Necessity and opinions','接続法と直説法の違いを学ぶ','Differentiate subjunctive triggers from factual statements',
      'Je pense qu’il est prêt, mais il faut qu’il fasse encore un essai.',
      '彼は準備ができていると思いますが、もう一度試す必要があります。','I think he is ready, but he still needs to try once more.',
      'il faut que + 接続法。肯定の je pense que は通常直説法をとります。','Il faut que takes subjunctive; affirmative je pense que usually takes indicative.',[
      E('Il faut que nous ___ à l’heure.',['sommes','soyons','serons','étions'],1,'Il faut que nous soyons à l’heure.','私たちは時間どおりでなければなりません。','We must be on time.','il faut que の後には接続法。être → soyons。','Il faut que triggers subjunctive: soyons.'),
      E('Je pense qu’il ___ raison.',['ait','a','aurait','eût'],1,'Je pense qu’il a raison.','彼は正しいと思います。','I think he is right.','肯定形の je pense que は通常直説法。','Affirmative je pense que normally takes indicative.'),
      E('Je veux que tu ___ plus tôt.',['viens','viennes','viendras','venais'],1,'Je veux que tu viennes plus tôt.','もっと早く来てほしい。','I want you to come earlier.','主節の願望に対する別主語の従属節には接続法。','Vouloir que with a different subject triggers subjunctive.'),
      E('Bien qu’il ___ tard, ils continuent.',['est','sera','soit','serait'],2,'Bien qu’il soit tard, ils continuent.','遅い時間なのに彼らは続けています。','Although it is late, they continue.','譲歩を表す bien que は接続法をとります。','Bien que introduces a concessive subjunctive clause.')]),
    U('B2','b2-reported','間接話法と時制','Reported speech','過去の発話を時制の対応込みで伝える','Report speech using sequence of tenses',
      'Elle m’a expliqué qu’elle partirait le lendemain, même si les billets coûtaient cher.',
      '彼女は、切符が高くても翌日出発するつもりだと説明しました。','She explained that she would leave the next day, even if the tickets were expensive.',
      '過去から見た未来は条件法。le lendemain は「その翌日」。','The conditional can express future-in-the-past; le lendemain anchors the next day.',[
      E('Il a dit qu’il ___ le lendemain.',['partira','partirait','part','parte'],1,'Il a dit qu’il partirait le lendemain.','彼は翌日出発すると言いました。','He said he would leave the next day.','過去の発話時点から見た未来は条件法現在。','Future viewed from a past speech event takes conditional.'),
      E('Elle a expliqué qu’elle ___ déjà fini.',['a','avait','aurait','ait'],1,'Elle a expliqué qu’elle avait déjà fini.','彼女はもう終えたと説明しました。','She explained that she had already finished.','説明した過去の時点より前なので大過去。','Completion precedes the reporting point: plus-que-parfait.'),
      E('Il m’a demandé ___ je pouvais venir.',['que','si','dont','ce qui'],1,'Il m’a demandé si je pouvais venir.','彼は私が来られるか尋ねました。','He asked me whether I could come.','はい／いいえで答える間接疑問には si。','Indirect yes/no questions take si.'),
      E('Elle affirme ___ ce projet est utile.',['si','que','dont','lequel'],1,'Elle affirme que ce projet est utile.','彼女はこの計画が役に立つと主張しています。','She claims this project is useful.','affirmer que + 内容節。','Affirmer introduces a content clause with que.')]),
    U('B2','b2-argument','議論と譲歩','Argument and concession','原因・対比・譲歩を論理的に示す','Build arguments with cause, contrast and concession',
      'Bien que la solution soit coûteuse, elle pourrait réduire les risques à long terme. En revanche, son efficacité reste à vérifier.',
      '解決策は高価ですが、長期的には危険を減らせるかもしれません。一方、その有効性は検証が必要です。','Although the solution is costly, it could reduce long-term risks. However, its effectiveness remains to be verified.',
      'bien que は接続法。en revanche は対比、pourrait は慎重な可能性の提示。','Bien que takes subjunctive; en revanche contrasts and pourrait hedges.',[
      E('___ la mesure soit chère, elle est nécessaire.',['Parce que','Bien que','Puisque','Comme'],1,'Bien que la mesure soit chère, elle est nécessaire.','費用が高くても、その措置は必要です。','Although the measure is expensive, it is necessary.','譲歩 + 接続法 soit の組み合わせが一致。','Bien que expresses concession and takes soit (subjunctive).'),
      E('Ce plan est rapide. ___, il comporte des risques.',['Par conséquent','En revanche','En effet','Ainsi'],1,'Ce plan est rapide. En revanche, il comporte des risques.','この計画は迅速です。一方で危険があります。','This plan is quick. On the other hand, it has risks.','長所に対する対比を en revanche で導きます。','En revanche introduces a contrast.'),
      E('Cette hypothèse reste à ___ .',['vérifier','vérifié','vérifiant','vérifie'],0,'Cette hypothèse reste à vérifier.','この仮説はまだ検証が必要です。','This hypothesis remains to be verified.','rester à + 不定詞で残された作業。','Rester à + infinitive marks a task still to do.'),
      E('Il a réduit les coûts ___ augmenter les risques.',['sans','pendant','depuis','selon'],0,'Il a réduit les coûts sans augmenter les risques.','危険を増やさず費用を減らしました。','He reduced costs without increasing risks.','sans + 不定詞は「〜せずに」。','Sans + infinitive means without doing.')]),
    U('B2','b2-precision','代名詞と一致','Pronouns and agreement','複合過去の一致・二重代名詞・数量を扱う','Handle object clitics and participle agreement',
      'Les lettres qu’elle a écrites sont arrivées. Elle les a envoyées hier et m’en a parlé.',
      '彼女が書いた手紙は届きました。彼女は昨日それらを送り、私にそのことを話しました。','The letters she wrote have arrived. She sent them yesterday and told me about them.',
      'avoir の過去分詞は前置された直接目的語と一致します。en は de 句を受けられます。','With avoir, a preceding direct object triggers participle agreement; en may replace a de-phrase.',[
      E('Les photos que j’ai ___ sont belles.',['pris','prise','prises','prendre'],2,'Les photos que j’ai prises sont belles.','私が撮った写真はきれいです。','The photos I took are beautiful.','前置された女性複数の直接目的語 photos に一致。','Photos is a preceding feminine-plural direct object, requiring prises.'),
      E('Je ___ ai donné la clé. (à Paul)',['lui','le','en','y'],0,'Je lui ai donné la clé.','私はポールに鍵を渡しました。','I gave Paul the key.','à Paul は間接目的語 lui。','Recipient à Paul becomes lui.'),
      E('Cette décision, je ___ ai parlé hier. (à Marie)',['la lui','lui en','en lui','le lui'],1,'Cette décision, je lui en ai parlé hier.','この決定について私は昨日マリーに話しました。','I told Marie about this decision yesterday.','parler de + 話題（en）/ à + 人（lui）の語順は lui en。','Parler de something à someone gives lui + en.'),
      E('Elle est ___ au bureau. (Marie)',['arrivé','arrivée','arrivés','arrivées'],1,'Elle est arrivée au bureau.','彼女は職場に到着しました。','She arrived at the office.','助動詞 être の arriver は女性単数主語に一致。','Être + arriver: participle agrees with the feminine singular subject.')]),
    U('C1','c1-caution','慎重な断定','Epistemic caution','確信・推論・不確実性を言い分ける','Distinguish certainty, probability and doubt',
      'Il semblerait que les résultats soient prometteurs, encore faut-il vérifier la méthode employée.',
      '結果は有望なようですが、使われた方法を検証する必要はなお残っています。','The results would appear promising; nevertheless the method used still needs verification.',
      'il semblerait que + 接続法は控えめな評価。encore faut-il は必要条件を付け加えます。','Il semblerait que + subjunctive signals caution; encore faut-il adds a necessary caveat.',[
      E('Il est possible que cette analyse ___ incomplète.',['est','soit','sera','était'],1,'Il est possible que cette analyse soit incomplète.','この分析は不完全かもしれません。','This analysis may be incomplete.','可能性を述べる il est possible que は接続法。','Il est possible que takes the subjunctive.'),
      E('Les données ___ indiquer une tendance, sans la prouver.',['pourraient','peuvent que','pourrons','puissiez'],0,'Les données pourraient indiquer une tendance, sans la prouver.','データは傾向を示すかもしれませんが、証明するものではありません。','The data might indicate a trend without proving it.','条件法 pourraient は断定の強さを弱めます。','Conditional pourraient hedges the inference.'),
      E('___ faut-il distinguer corrélation et causalité.',['Encore','Pourtant que','Afin','Bien que'],0,'Encore faut-il distinguer corrélation et causalité.','それでも相関と因果を区別する必要があります。','One still has to distinguish correlation from causation.','encore faut-il + 不定詞は留保・必要条件を示す倒置構文。','Encore faut-il is an inverted construction adding a necessary qualification.'),
      E('La prudence s’impose, ___ les données restent fragmentaires.',['car','quoique','pour que','à moins que'],0,'La prudence s’impose, car les données restent fragmentaires.','データが断片的なので慎重である必要があります。','Caution is necessary, because the data remain fragmentary.','car は直説法による理由を導きます。','Car introduces an explanation in an indicative clause.')]),
    U('C1','c1-register','書き言葉と構文','Formal written French','分詞構文、焦点化、文体を読み分ける','Read formal participial and focus constructions',
      'Une fois les données recueillies, il convient d’en examiner les limites. C’est sur ce point que porte notre analyse.',
      'データ収集後、その限界を検討するのが適切です。私たちの分析が対象にするのはこの点です。','Once the data have been collected, their limitations should be examined. This is the point our analysis addresses.',
      'une fois + 過去分詞、il convient de、c’est ... que に注目。','Notice une fois + past participle, il convient de, and the cleft c’est ... que.',[
      E('Une fois les résultats ___, nous publierons le rapport.',['vérifier','vérifiés','vérifiant','vérifient'],1,'Une fois les résultats vérifiés, nous publierons le rapport.','結果を確認した後に報告書を出します。','Once the results are verified, we will publish the report.','une fois + 名詞 + 過去分詞。résultats（男性複数）に一致。','Une fois + noun + past participle; vérifiés agrees with résultats.'),
      E('Il convient ___ examiner les objections.',['à','d’','pour','en'],1,'Il convient d’examiner les objections.','反論を検討することが適切です。','It is appropriate to examine the objections.','il convient de + 不定詞。母音前で d’。','Il convient de + infinitive, elided to d’.'),
      E('C’est sur ce point ___ porte notre critique.',['qui','dont','que','où'],2,'C’est sur ce point que porte notre critique.','私たちの批判が向けられるのはこの点です。','It is on this point that our criticism focuses.','c’est ... que は焦点化構文。','C’est ... que is a cleft highlighting the phrase.'),
      E('Ce texte, ___ je suis en désaccord avec ses conclusions, mérite lecture.',['bien que','quoique','même si','pour que'],2,'Ce texte, même si je suis en désaccord avec ses conclusions, mérite lecture.','結論には同意しないとしても、この文章は読む価値があります。','This text deserves reading even if I disagree with its conclusions.','直説法 suis に合う譲歩節は même si。','Même si takes indicative suis; bien que/quoique require subjunctive sois.')]),
    U('C1','c1-logic','論理構造を見抜く','Discourse logic','反論・結論の留保・論証の進行を追う','Track counterarguments and limited conclusions',
      'Certes, la réforme a produit des gains immédiats. Toutefois, rien ne garantit que ceux-ci se maintiennent à long terme.',
      '確かに改革は直ちに成果を生みました。しかし、その成果が長期的に続く保証はありません。','Admittedly, the reform brought immediate gains. However, nothing guarantees that they will last.',
      'certes ... toutefois は譲歩から反論への構造。rien ne garantit que は確実性を否定します。','Certes ... toutefois concedes then counters; rien ne garantit que denies assurance.',[
      E('___ la mesure soit efficace, son coût pose problème.',['Quoique','Puisque','Alors que','Parce que'],0,'Quoique la mesure soit efficace, son coût pose problème.','措置が有効だとしても、その費用は問題です。','Although effective, the measure raises cost issues.','quoique + 接続法 soit。','Quoique is concessive and requires subjunctive.'),
      E('La méthode est rapide ; ___, sa précision reste limitée.',['en effet','toutefois','par conséquent','de surcroît'],1,'La méthode est rapide ; toutefois, sa précision reste limitée.','方法は速いですが、その精度には限界があります。','The method is fast; nevertheless its accuracy remains limited.','速度の利点と精度の限界を toutefois で対比。','Toutefois introduces a limitation contrasting with an advantage.'),
      E('À supposer que ces résultats ___ fiables, ils ne suffiraient pas à conclure.',['sont','soient','seraient','seront'],1,'À supposer que ces résultats soient fiables, ils ne suffiraient pas à conclure.','仮にこれらの結果が信頼できても、結論を出すには不十分でしょう。','Even assuming the results are reliable, they would not suffice for a conclusion.','à supposer que + 接続法で仮定を置き、条件法で結論を留保します。','À supposer que takes subjunctive; the conditional makes the conclusion tentative.'),
      E('Il s’agit ___ distinguer deux interprétations.',['à','de','pour','en'],1,'Il s’agit de distinguer deux interprétations.','二つの解釈を区別することが問題です。','The task is to distinguish two interpretations.','il s’agit de + 不定詞。','Il s’agit de + infinitive introduces the issue at hand.')]),
    U('C2','c2-implication','含意を精密に読む','Fine implications','表面の賛否を超えた含意と立場を識別する','Recognize irony, understatement and marked stance',
      'Dire que cette solution est parfaite serait, pour le moins, prématuré. Encore faudrait-il qu’elle résiste à un examen indépendant.',
      'この解決策が完璧だと言うのは、控えめに言っても時期尚早でしょう。まず独立した検証に耐える必要があります。','Calling the solution perfect would be premature, to say the least. It would first have to withstand independent scrutiny.',
      'pour le moins は控えめな批判、encore faudrait-il que + 接続法は強い留保。','Pour le moins understates criticism; encore faudrait-il que + subjunctive raises a prerequisite.',[
      E('Il serait, ___ le moins, imprudent de conclure si vite.',['par','pour','sur','dans'],1,'Il serait, pour le moins, imprudent de conclure si vite.','そんなに早く結論を出すのは、控えめに言っても軽率です。','It would be imprudent, to say the least, to conclude so quickly.','慣用句 pour le moins は控えめに評価する言い回し。','Pour le moins is an idiom meaning “to say the least”.'),
      E('Encore faudrait-il qu’il ___ des preuves.',['fournit','fournisse','fournira','fournissait'],1,'Encore faudrait-il qu’il fournisse des preuves.','そもそも彼が証拠を示す必要があります。','He would first have to provide evidence.','条件付きの必要性 faudrait-il の後は接続法 fournisse。','Faudrait-il que governs subjunctive fournisse.'),
      E('Il n’est pas ___ que cette décision soit définitive.',['dit','dire','disant','dira'],0,'Il n’est pas dit que cette décision soit définitive.','この決定が最終的とは限りません。','It is not necessarily the case that the decision is final.','il n’est pas dit que は断定できないという慣用表現。','Il n’est pas dit que expresses that something is not a foregone conclusion.'),
      E('Le résultat est ___ satisfaisant, mais les réserves demeurent.',['certes','quoique','en dépit','nonobstant'],0,'Le résultat est certes satisfaisant, mais les réserves demeurent.','結果は確かに満足できるものですが、留保は残ります。','The result is admittedly satisfactory, but reservations remain.','certes ... mais で認めた後に反論を示します。','Certes ... mais signals concession followed by a counterpoint.')]),
    U('C2','c2-style','文体と意味の差','Style and register','倒置・語彙選択・焦点化の効果を説明できる','Recognize the effect of inversion, emphasis and register',
      'Rares sont les observateurs qui contestent le diagnostic ; nombreux sont, en revanche, ceux qui doutent du remède.',
      '診断に異議を唱える観察者は少ない。一方、処方策を疑う人は多い。','Few observers dispute the diagnosis; by contrast, many doubt the remedy.',
      'rares sont ... / nombreux sont ... の対称的な倒置は書き言葉の強調。','Parallel inversions rares sont / nombreux sont create rhetorical balance.',[
      E('___ sont les auteurs qui abordent ce détail.',['Rares','Rarement','Rare','Rareté'],0,'Rares sont les auteurs qui abordent ce détail.','この細部を扱う著者は少ないです。','Few authors address this detail.','rares sont les ... は形容詞を前置する倒置・強調。','Rares sont les ... uses fronted adjective and inversion.'),
      E('Il n’en demeure pas ___ que le problème persiste.',['moins','plus','tant','assez'],0,'Il n’en demeure pas moins que le problème persiste.','それでもなお問題が残っていることに変わりません。','It nonetheless remains true that the problem persists.','il n’en demeure pas moins que は反論を踏まえた残存事実。','Il n’en demeure pas moins que is a fixed concessive expression.'),
      E('___ qu’il en soit, la recherche doit continuer.',['Quoi','Quel','Quoique','Comment'],0,'Quoi qu’il en soit, la recherche doit continuer.','いずれにせよ、研究は続けなければなりません。','Be that as it may, research must continue.','quoi qu’il en soit は接続法を含む固定句。','Quoi qu’il en soit is a set concessive phrase with subjunctive.'),
      E('Son propos prête ___ confusion.',['à','de','en','par'],0,'Son propos prête à confusion.','彼の発言は誤解を招きます。','His statement lends itself to confusion.','prêter à confusion は慣用的な語の結びつき。','Prêter à confusion is a fixed collocation.')]),
    U('C2','c2-argument','複合的な論証','Complex argumentation','言い換え・反語・証拠の限界を精密に述べる','Read qualifications and rhetorical structures precisely',
      'Loin de dissiper les doutes, cette publication les a ravivés, non que ses conclusions fussent erronées, mais parce que sa méthode restait opaque.',
      '疑念を払拭するどころか、この発表は疑念を再燃させました。結論が誤っていたからではなく、方法が不透明だったからです。','Far from dispelling doubts, the publication revived them—not because its conclusions were wrong, but because its method remained opaque.',
      'loin de + 不定詞は逆の結果を強調。non que ... mais parce que ... は原因を区別する論証。','Loin de + infinitive highlights the opposite effect; non que ... mais parce que ... distinguishes causes.',[
      E('___ de résoudre le problème, cette mesure l’a aggravé.',['Loin','Près','Au lieu','Faute'],0,'Loin de résoudre le problème, cette mesure l’a aggravé.','問題を解決するどころか、その措置は悪化させました。','Far from solving the problem, the measure worsened it.','loin de + 不定詞は期待とは反対の展開。','Loin de + infinitive emphasizes the contrary outcome.'),
      E('Non que son analyse ___ fausse, mais elle reste partielle.',['est','soit','sera','était'],1,'Non que son analyse soit fausse, mais elle reste partielle.','彼の分析が誤っているというのではなく、まだ部分的なのです。','Not that his analysis is false; rather, it remains partial.','non que に導かれる否定された理由には接続法。','Non que takes subjunctive for a rejected explanation.'),
      E('___-ce à dire que l’expérience est concluante ?',['Est','Sera','Faut','Peut'],0,'Est-ce à dire que l’expérience est concluante ?','それは実験が決定的だという意味でしょうか。','Does that mean the experiment is conclusive?','est-ce à dire que は直前の論理的帰結を問い直す定型句。','Est-ce à dire que challenges an inferred conclusion.'),
      E('Il importe moins de convaincre ___ d’éclairer le débat.',['que','dont','si','pour'],0,'Il importe moins de convaincre que d’éclairer le débat.','説得することより、議論を明らかにすることが重要です。','It matters less to persuade than to clarify the debate.','moins de ... que de ... で二つの不定詞を比較。','Moins de ... que de ... compares two infinitive goals.')])
  ];
  const questions=units.flatMap(u=>u.items);
  return {levels,units,questions};
})();
