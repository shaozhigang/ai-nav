# Toolso.AI 本地运行教程

本文档介绍如何在本地启动 Toolso.AI 开发环境。

## 一、前置要求

| 工具 | 版本要求 | 检查命令 |
|------|----------|----------|
| Node.js | 18+ | `node -v` |
| pnpm | 8+ | `pnpm -v` |
| PostgreSQL | 任意可用实例 | 见下文 |

## 二、准备 PostgreSQL 数据库

项目**必须**有 PostgreSQL 数据库。如果没有本地数据库，推荐使用免费云数据库（最快上手）：

### 方案 A：Neon（推荐，免费）

1. 打开 [https://neon.tech](https://neon.tech) 注册
2. 创建项目 → 复制连接字符串
3. 格式类似：`postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### 方案 B：Supabase

1. 打开 [https://supabase.com](https://supabase.com) 创建项目
2. Settings → Database → Connection string（URI 模式）

### 方案 C：本地 PostgreSQL

安装 PostgreSQL 后创建数据库，例如：

```
postgresql://postgres:password@localhost:5432/ai_nav
```

## 三、安装依赖

在项目根目录执行：

```bash
pnpm install
```

> **注意**：项目使用 **pnpm**（`package.json` 中指定了 `packageManager`），请使用 `pnpm install`，不要使用 `npm install`，避免锁文件冲突。

## 四、配置环境变量

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

```bash
# macOS / Linux
cp .env.example .env.local
```

用编辑器打开 `.env.local`，至少填写以下**必需项**：

```env
# 数据库（换成你的连接字符串）
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# 认证密钥（至少 32 字符，可用下方命令生成）
BETTER_AUTH_SECRET="your-super-secret-key-at-least-32-characters-long"

# 本地地址
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 邮件服务（注册/验证邮箱需要）
RESEND_API_KEY="re_你的密钥"
RESEND_FROM_EMAIL="Toolso.AI <onboarding@resend.dev>"
```

### 生成随机密钥

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Resend 邮件配置

1. 注册 [https://resend.com](https://resend.com)
2. 创建 API Key → 填入 `RESEND_API_KEY`
3. 开发阶段可使用测试发件地址 `onboarding@resend.dev`（Resend 免费账号支持）

完整说明（含生产环境域名验证、DNS 配置、排错）见 [Resend 邮件配置指南](./resend-configuration.md)。

### Google 登录（可选）

- 不配置也能正常运行，邮箱密码登录可用
- 如需 Google 登录，到 [Google Cloud Console](https://console.cloud.google.com/) 创建 OAuth 凭据，填入 `AUTH_GOOGLE_ID` 和 `AUTH_GOOGLE_SECRET`

完整环境变量说明请参考项目根目录的 [`.env.example`](../.env.example)。

## 五、初始化数据库

```bash
pnpm db:push
```

这会将 Drizzle Schema 同步到 PostgreSQL，创建用户、工具、分类等表。

验证（可选）：

```bash
pnpm db:studio
```

浏览器会打开 Drizzle Studio，可查看表结构。

## 六、导入示例数据（可选但推荐）

首页工具目录默认是空的，可导入 50 个示例 AI 工具：

```bash
pnpm seed:tools
```

## 七、启动开发服务器

```bash
pnpm dev
```

看到类似输出即表示启动成功：

```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

浏览器访问：

| 地址 | 说明 |
|------|------|
| http://localhost:3000 | 首页（默认英文） |
| http://localhost:3000/zh | 中文版 |
| http://localhost:3000/tools | AI 工具目录 |
| http://localhost:3000/login | 登录 |
| http://localhost:3000/admin | 管理后台（需管理员权限） |

## 八、创建管理员账号

管理后台需要 `role = admin`，分两步完成：

### 1. 先注册普通账号

访问 http://localhost:3000/signup，用邮箱注册并完成邮件验证（需要 Resend 配置正确）。

### 2. 提升为管理员

**Windows PowerShell：**

```powershell
$env:ADMIN_EMAIL="your-email@example.com"
pnpm admin:setup
```

**macOS / Linux：**

```bash
ADMIN_EMAIL=your-email@example.com pnpm admin:setup
```

将 `your-email@example.com` 替换为你注册时使用的邮箱。

成功后访问 http://localhost:3000/admin 即可进入管理后台。

## 九、完整启动流程（速查）

```bash
pnpm install
cp .env.example .env.local   # Windows: Copy-Item .env.example .env.local
# 编辑 .env.local，填写 DATABASE_URL、BETTER_AUTH_SECRET、RESEND_API_KEY 等
pnpm db:push
pnpm seed:tools              # 可选
pnpm dev
```

## 十、常见问题

### 1. `DATABASE_URL` 连接失败

- 检查连接字符串是否正确
- 云数据库需加 `?sslmode=require`
- 本地数据库确认 PostgreSQL 服务已启动

### 2. 注册后收不到验证邮件

- 检查 `RESEND_API_KEY` 是否有效
- 开发环境使用 `onboarding@resend.dev` 作为发件人
- Resend 免费版只能发到注册账号的邮箱（测试限制）

### 3. 端口 3000 被占用

```bash
pnpm dev -- -p 3001
```

同时把 `.env.local` 里的 `BETTER_AUTH_URL` 和 `NEXT_PUBLIC_APP_URL` 改为 `http://localhost:3001`。

### 4. Google 登录报错

- 未配置 OAuth 时可忽略，使用邮箱密码登录
- 配置后需在 Google Console 添加回调地址：`http://localhost:3000/api/auth/callback/google`

### 5. 首页没有工具

- 运行 `pnpm seed:tools` 导入示例数据
- 或在管理后台手动添加/审核工具

### 6. Windows 下 `pnpm dev` 报错

- 项目已内置 Windows 兼容脚本（`scripts/run-dev.mjs`），一般直接 `pnpm dev` 即可
- 若仍有问题，可尝试：`npx next dev`

## 功能与依赖对照

| 功能 | 最低要求 |
|------|----------|
| 浏览首页、工具目录、博客 | 数据库 + 基础环境变量 |
| 邮箱注册/登录 | + Resend |
| Google 登录 | + Google OAuth 凭据 |
| 管理后台 | + 注册账号 + `admin:setup` |
| 文件上传 | + R2/S3 存储配置（可选） |

## 相关文档

- [README](../README.md) — 项目概览与部署说明
- [CLAUDE.md](../CLAUDE.md) — 开发指南与架构说明
- [Resend 邮件配置指南](./resend-configuration.md) — 本地开发与生产域名验证
- [.env.example](../.env.example) — 完整环境变量模板
