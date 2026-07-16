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

cp .dev.vars.example .dev.vars

# wrangler.jsoncへdatabase_nameとdatabase_idを設定

pnpm db:generate
pnpm db:migrate:local
pnpm cf:dev
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

# Better Auth の設定

ローカル開発用に `.dev.vars` を作成します。

```bash
cp .dev.vars.example .dev.vars
```

必要な環境変数を設定してください。

```dotenv
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:8787
```

secretは以下のコマンドで発行した値を利用します。

```bash
openssl rand -base64 32
```

リモート環境では Wrangler Secret を利用します。

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
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
pnpm db:migrate:remote
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
