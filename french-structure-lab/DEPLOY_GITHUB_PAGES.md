# French Structure Lab — GitHub Pages 公開手順（Mac → iPhone）

**状態：** このZIPは公開用に準備済みですが、GitHubへのアップロードとGitHub Pagesの有効化は未実行です。
GitHubアカウントの利用者本人が実施する手順です。外部への公開はソースコードと教材のみで、ローカルの学習記録はアップロードされません。

## 1. 最初にバックアップ

すでにv0.1 / v0.2を使って学習している場合、そのアプリの「学習記録」→「完全バックアップJSON」を保存します。Macのfile://からGitHub Pagesに移ると、保存場所（origin）が異なるため、ローカル記録は自動で移りません。

## 2. 公開用リポジトリを作る

1. MacでGitHubにサインインし、[新しいリポジトリを作成](https://github.com/new)へ。
2. Repository name: `french-structure-lab`
3. Visibility: `Public` を選択します（GitHub Pagesの利用条件は現在のプランで確認してください）。
4. 「Create repository」を押します。**既存の他の語学アプリのリポジトリは変更しません。**

## 3. アプリをアップロード

1. このZIPを展開します。
2. 作成した `french-structure-lab` リポジトリの「uploading an existing file」または「Add file → Upload files」を開きます。
3. 展開した `french-structure-lab` フォルダーの中にある全ファイルをまとめて選びます。`index.html`、`app.js`、`data.js`、`curriculum.js`、**`learning-insights.js`**、`styles.css`、`sw.js`、アイコン類、`manifest.webmanifest`、READMEなどです。
4. **ZIP自体をアップロードするのではありません。** また、`index.html`がリポジトリの直下にあるように配置してください。フォルダーごと一段下に入れないことが重要です。
5. 「Commit changes」を押します。

## 4. GitHub Pagesを有効化

1. リポジトリ → **Settings → Pages**
2. Build and deployment → **Deploy from a branch**
3. Branchは `main`、Folderは `/ (root)` を選んで Save。
4. GitHub Pagesのデプロイが完了したら、次のURLを開きます。

`https://ohganed.github.io/french-structure-lab/`

**注意:** このURLは設定が完了するまで開けません。現時点では公開済みとは確認していません。

## 5. iPhoneで使う

1. iPhone Safariから上記URLを開きます。
2. 「共有」→「ホーム画面に追加」。
3. ホーム画面からFrench Labを開き、A1〜C2教材・今日の練習・学習記録を確認します。
4. 以前の学習記録がある場合は、**新しいURLのアプリ**で「教材・データ」→「学習データを復元する」を開き、バックアップJSONを取り込みます。現在の記録を置換するため、必ず注意書きを確認してください。

## 6. アップデートするとき

リポジトリの同名ファイルを新しいバージョンで更新します。`sw.js`のキャッシュ版数はv0.3.0で変更済みです。公開後に古い画面が出る場合はSafariで再読み込みを試してください。

## データ保護と制約

- 学習記録はアプリを開いているブラウザのlocalStorage内に保存されます。GitHubリポジトリに学習履歴は書き込まれません。
- **MacとiPhoneの自動同期/iCloud自動保存はまだありません。** 別端末へ移す場合はJSONバックアップを保存し、移行先で復元します。
- 「AI分析用JSON」は個人的な振り返りメモなどを含む場合があります。公開リポジトリにはアップロードせず、自分で共有先を選んでください。
- GitHub Pages公開・iPhone実機Safari・音声・オフライン動作の実機検証は、ユーザー側で確認が必要です。
