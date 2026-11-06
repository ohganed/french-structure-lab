# Cognition Studio v0.7.0 — 設計の根拠と検証方針

## 目的

フランス語を「単語 → 文法問題」の順序だけでなく、**場面を読み取る → 状況モデルを作る → 階層構造を確かめる → 文を産出する → 別の場面に移す → 振り返る**流れで学ぶ。既存のCEFR教材・仏検問題を置き換えず、補完する。

## 3つの理論を混同しない

**Albus & Meystel (2001), Engineering of Mind:** 同著の知能システムの参照アーキテクチャにおける sensory perception, world modeling, value judgment, behavior generation の機能分離とフィードバックを教材設計に参照。教育上の対応は「場面の要点を捉える／状況を予想する／何を伝えるか判断する／文を作る／結果に基づいて次を決める」。脳内でこの順序が実現されると主張するものではない。

**Pecher & Zwaan (eds., 2005), Grounding Cognition:** 概念理解と知覚・行為・身体・環境・社会的状況との接続を重視。空間・方向・時間・視点・話者の意図を先に捉え、その後で「y / en」「aller / venir」「時制」などの文法形式を選ぶ。抽象概念をすべて身体感覚に還元しない。

**Chomsky, Generative Grammar:** 主語句・述部・補文・関係節・統語依存関係を見せ、単純な単語列だけで説明しない。理論から着想を得た学習用の簡略構文表示であり、生成文法の生得説や特定の変形理論の実証を意味しない。第二言語への適用については複数の立場がある。

## 学習単位

11ユニット: A1(2)、A2(2)、B1(3)、B2(2)、C1(1)、C2(1)。
各ユニットの手順: (1) 状況に合う解釈を3択、(2) 簡略構造と補語の関係を表示、(3) 4択文法形式、(4) 別場面で4択応用。

すべて独自作成。公式仏検過去問ではない。選択式だけなので自由産出や自然会話の運用能力を十分に測れない。

## 学習記録・復習

- localStorage キー: french-structure-lab:v1:cognitionAttempts（解答履歴）、cognitionActive（途中再開）。
- 解答履歴は id, level, stage, correct, selected, expected, confidence, at。直近1,800件まで。
- スタジオの次回提案: 当該単元の直近3件に誤答・低自信度があれば再学習、そうでなければ未学習、すべて学習済みなら最終解答が最も古い単元を推薦。
- 説明可能なルールベース提案であり、AIの認知状態推定やCEFR実力判定ではない。
- 既存の完全バックアップ・AI分析用JSONにもこのデータを含める。古いバックアップをインポートしても、新規の認知記録を自動消去しない。

## 効果検証の計画

単純な選択式文法練習と同等の内容・時間の認知スタジオ練習を比較。練習直後の同型問題のみでなく、**未習場面への転移問題・7日後の保持・説明の正確性・認知的負荷**を指標にする。今の実装から教授効果が実証されたとは言わない。

## 参照文献

- Albus, J. S., & Meystel, A. M. (2001), *Engineering of Mind*, Wiley. https://www.nist.gov/publications/engineering-mind-introduction-science-intelligent-systems
- Pecher, D., & Zwaan, R. A. (eds.) (2005), *Grounding Cognition*, Cambridge University Press. https://www.cambridge.org/core/books/grounding-cognition/E322E21124B7DEB879293E6F64DEC70B
- Universal Grammar and the learning and teaching of second languages, Cambridge University Press. https://www.cambridge.org/core/services/aop-cambridge-core/content/view/EB424744392C0A6BBF40671EAF3527FD/9781139524605c2_p25-48_CBO.pdf/universal_grammar_and_the_learning_and_teaching_of_second_languages.pdf
