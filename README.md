# Cloudflare WebApp Template

Cloudflare Workers、Hono、React、D1、Drizzle ORM、Better Authを利用した
Webアプリケーションテンプレートです。

## 技術スタック

- Cloudflare Workers
- Hono
- React
- Vite
- D1 Database
- Drizzle ORM
- Better Auth
- Vitest
- Playwright
- GitHub Actions

---

# 必要環境

- Node.js 24
- pnpm 10
- Cloudflare アカウント

---

# Quick Start

```bash
pnpm install
pnpm exec wrangler login
pnpm exec wrangler d1 create <database-name>

# wrangler.jsoncへdatabase_nameとdatabase_idを設定

cp .dev.vars.example .dev.vars
cp .env.example .env
openssl rand -base64 32

# .dev.varsへ貼り付け
```

```bash
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:remote
pnpm run deploy
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

その後、詳細は下記のセットアップ手順を参照してください。

---

# セットアップ

## 1. リポジトリを取得

```bash
git clone <repository>
cd <repository>
```

## 2. パッケージをインストール

```bash
pnpm install
```

## 3. Cloudflareへログイン

```bash
pnpm exec wrangler login
```

---

# D1 Database の作成

Cloudflare上でD1データベースを作成します。

```bash
pnpm exec wrangler d1 create <database-name>
```

実行すると次のような情報が表示されます。

```text
database_name = my-app-db
database_id = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

`wrangler.jsonc` の `database_id` を更新してください。

```jsonc
{
    "d1_databases": [
        {
            "binding": "DB",
            "database_name": "<database-name>",
            "database_id": "<database-id>",
        },
    ],
}
```

---

# データベース

## Migration 作成

```bash
pnpm db:generate
```

## ローカルへ適用

```bash
pnpm db:migrate:local
```

## リモートへ適用

```bash
pnpm db:migrate:remote
```

---

# Better Auth の設定

ローカル開発用に `.dev.vars` を作成します。

```bash
cp .dev.vars.example .dev.vars
```

必要な環境変数を設定してください。

```dotenv
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:8787
PASSWORD_RESET_EMAIL_FROM=noreply@example.com
SIGN_UP_ENABLED=false
```

secretは以下のコマンドで発行した値を利用します。

```bash
openssl rand -base64 32
```

リモート環境では Wrangler Secret を利用します。

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

パスワード再設定メールは Cloudflare Email Service の `EMAIL` binding から送信します。
`PASSWORD_RESET_EMAIL_FROM` には、Email Service に登録済みの送信元アドレスを設定してください。

## 新規ユーザー登録の公開設定

デフォルトでは公開登録は無効です。公開登録を有効にする場合は、サーバー側とフロントエンド側の両方を有効にしてください。

```dotenv
# .dev.vars / Wrangler vars
SIGN_UP_ENABLED=true

# .env / build environment
VITE_SIGN_UP_ENABLED=true
```

`SIGN_UP_ENABLED=false` の場合、Better Auth の登録 API は拒否されます。
`VITE_SIGN_UP_ENABLED=false` の場合、ログイン画面の登録リンクと `/sign-up` の登録フォームは表示されません。

---

# テンプレート利用時に変更する項目

- `package.json`
    - `name`
    - `description`
    - `version`
- `wrangler.jsonc`
    - `name`
    - `database_name`
    - `database_id`
- `src/frontend/index.html`
    - `title`
- `.dev.vars`
    - `BETTER_AUTH_SECRET`
    - `BETTER_AUTH_URL`
    - `PASSWORD_RESET_EMAIL_FROM`
    - `SIGN_UP_ENABLED`
- `.env`
    - `VITE_SIGN_UP_ENABLED`

---

# 開発

Workerを起動します。

```bash
pnpm cf:dev
```

別ターミナルでフロントエンドを起動します。

```bash
pnpm dev
```

---

# テスト

バックエンド・フロントエンドテスト

```bash
pnpm test
```

---

# 品質チェック

リリース前には必ず実行してください。

```bash
pnpm check
```

以下をまとめて実行します。

- Format
- Type Check
- Lint
- Backend Test
- Frontend Test
- Build

---

# デプロイ

Migration適用後にデプロイします。

```bash
pnpm deploy
```

---

# ディレクトリ構成

```text
.
├── .github
│   └── workflows
├── migrations
├── src
│   ├── backend
│   └── frontend
├── drizzle.config.ts
├── vite.config.ts
├── vitest.config.ts
├── vitest.browser.config.ts
├── wrangler.jsonc
└── package.json
```

---

# GitHub Actions

Pull Request作成時に自動で以下を実行します。

- Format Check
- Type Check
- Lint
- Backend Test
- Frontend Test
- Build

すべて成功した場合のみマージすることを推奨します。

---

# ライセンス

必要に応じてプロジェクトごとに設定してください。
