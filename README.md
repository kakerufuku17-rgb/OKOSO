# OKOSO — Vercel デプロイ手順

理想の人生と今日の行動を繋ぎ続ける伴走OS。
「前進の翻訳」（節目のAI翻訳）を動かすために、Anthropic APIをサーバー側プロキシ経由で呼びます。

## フォルダ構成

```
okoso-deploy/
├── public/
│   └── index.html      ← OKOSO本体（単一HTMLファイル）
├── api/
│   └── translate.js    ← サーバーレス関数（APIキーを隠すプロキシ）
├── vercel.json         ← Vercel設定
└── README.md           ← このファイル
```

## デプロイ手順

### 1. Anthropic APIキーを用意
console.anthropic.com でAPIキー（`sk-ant-...`）を発行します。

### 2. Vercelにデプロイ

**方法A：Vercel CLI**
```bash
npm i -g vercel
cd okoso-deploy
vercel
```
途中の質問はデフォルトでEnterでOKです。

**方法B：GitHub経由**
1. このフォルダをGitHubリポジトリにpush
2. vercel.com で「New Project」→そのリポジトリを選択→Deploy

### 3. 環境変数にAPIキーを設定（最重要）
Vercelのプロジェクト画面 → **Settings → Environment Variables** で以下を追加：

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | あなたのAPIキー（sk-ant-...） |

追加したら **Deployments → 最新のデプロイ → Redeploy** で再デプロイします（環境変数は再デプロイで反映されます）。

### 4. 完了
発行されたURL（`https://あなたのプロジェクト.vercel.app`）にアクセスすればOKOSOが動きます。

## 動作の確認ポイント

- **前進の翻訳は節目だけ**：前進した日（前進ログまたはジャーナルを残した日）が累計で 7 / 30 / 90 / 180 / 365 日に達した時のみ生成されます。それ以外の日は一切APIを呼びません。一度生成した節目は二度と再生成されません。
- **APIキーが無くても動く**：キー未設定や通信失敗時は、アプリ内蔵のフォールバック翻訳（思想に忠実なテンプレート）に自動で切り替わります。まずキー無しでデプロイして動作を確認し、後からキーを足すこともできます。
- **データはブラウザに保存**：理想・前進ログ・ジャーナルなどは各自のブラウザのlocalStorageに保存されます（サーバーには送られません。翻訳生成時だけ、その時の要約がAPIに渡されます）。

## セキュリティについて

APIキーはサーバー側の環境変数にのみ置かれ、ブラウザには一切出ません。`api/translate.js` がプロキシとして間に入ることで、キーを守りつつCORSの問題も回避しています。

## スマホ・PC間の同期（GitHub Gist）

OKOSOは端末間でデータを同期できます。サーバー不要・月額0円で、GitHubの無料機能（Gist）を保管場所として使います。

### 使い方

1. 右上の同期アイコン（○）をタップ
2. GitHubで Personal Access Token を発行
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - スコープは **gist だけ** にチェック（他の権限は不要・安全のため）
3. Tokenを貼り付けて「同期を始める」→ 1台目は自動でGistが作られます
4. 表示された **Gist ID をコピー**
5. 2台目（スマホなど）で同じ画面を開き、同じToken＋コピーしたGist IDを入れる

これで両方の端末が同じ記録を共有します。記録するたびに自動でGistへ保存され、起動時に最新を取得してマージします。

### 同期の仕組み

- **マージ方式**：前進ログ・ジャーナルなどの追記データはIDで重複排除して「両方残す」ので、スマホとPCで別々に書いても消えません。理想・目標などの単一項目は、更新時刻が新しい方を採用します。
- **Tokenの保存場所**：各端末のブラウザ（localStorage）にのみ保存され、Gistには同期されません。gistスコープのみで発行すれば、万一漏れてもできるのはGistの読み書きだけです。
- **同期インジケーター**：右上のアイコンが ● 同期済み / ↑ アップロード中 / ↓ ダウンロード中 / ! エラー を示します。

