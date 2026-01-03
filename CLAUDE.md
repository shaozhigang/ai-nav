# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个**开源的 AI 工具导航站 (Toolso.AI)**，帮助用户发现和探索各类优秀的 AI 工具。基于 Next.js 16 构建，拥有现代化的响应式界面、强大的搜索和筛选功能、多语言支持。

**核心特性**:
- AI 工具目录 (分类展示、搜索筛选、工具详情)
- 工具提交 (用户可提交新工具，社区驱动)
- 管理后台 (工具审核、用户管理、角色权限)
- 博客系统 (MDX 驱动，AI 资讯和教程)
- 国际化支持 (中文/英文)
- 用户认证 (Better Auth + Google OAuth)

## 技术栈

### 前端
- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS + Framer Motion 动画
- **UI 组件**: 自定义组件库 + Radix UI
- **表单**: React Hook Form + Zod 验证
- **主题**: next-themes (深色/浅色模式)
- **国际化**: next-intl (动态路由 `[locale]`)

### 后端
- **身份认证**: Better Auth (邮箱密码 + Google OAuth)
- **数据库**: PostgreSQL + Drizzle ORM
- **邮件**: Resend (验证邮件 + Newsletter)
- **存储**: Cloudflare R2 / AWS S3 兼容 (可选)

### 开发工具
- **类型安全**: TypeScript (strict mode)
- **代码规范**: ESLint
- **包管理**: pnpm

## 项目结构

```
├── src/                       # 源代码目录
│   ├── app/[locale]/          # 国际化路由
│   │   ├── (auth)/            # 认证页面 (登录、注册、忘记密码)
│   │   ├── (marketing)/       # 营销页面 (首页、博客、联系、工具目录)
│   │   ├── (protected)/       # 需要认证的页面 (仪表板、个人资料)
│   │   ├── (admin)/           # 管理后台 (用户管理、工具管理)
│   │   ├── check-email/       # 邮箱验证提示页
│   │   └── verify-email/      # 邮箱验证处理页
│   ├── app/api/               # API 路由
│   │   ├── auth/              # Better Auth + 自定义认证端点
│   │   ├── admin/             # 管理员操作 API
│   │   ├── user/              # 用户信息 API
│   │   └── upload/            # 文件上传 API
│   ├── components/            # 可重用 UI 组件
│   ├── features/              # 功能模块
│   │   ├── auth/              # 认证组件和逻辑
│   │   ├── admin/             # 管理后台组件
│   │   ├── navigation/        # 导航组件
│   │   ├── tools/             # AI 工具目录模块
│   │   └── forms/             # 表单组件
│   ├── lib/                   # 核心业务逻辑
│   │   ├── auth.ts            # Better Auth 配置
│   │   ├── auth-client.ts     # 前端认证客户端
│   │   ├── db/                # 数据库连接和 Schema
│   │   ├── email.ts           # 邮件发送逻辑
│   │   ├── blog.ts            # 博客系统逻辑
│   │   ├── r2-storage.ts      # R2/S3 存储
│   │   ├── i18n.ts            # 国际化配置
│   │   └── metadata.ts        # SEO 元数据生成
│   ├── constants/             # 常量定义
│   │   └── website.ts         # 网站基础信息
│   ├── context/               # React Context
│   ├── emails/                # 邮件模板 (React Email)
│   ├── layouts/               # 布局组件
│   └── drizzle/               # 数据库迁移文件
├── messages/                  # 国际化翻译文件
│   ├── en.json                # 英文 (含 SEO)
│   └── zh.json                # 中文 (含 SEO)
├── public/                    # 静态资源
└── scripts/                   # 构建和管理脚本
```

## 数据库架构

当前包含 6 个核心表：

```sql
-- 用户表
user (id, name, email, emailVerified, image, role, banned, banReason, banExpires, createdAt, updatedAt)

-- 认证表
session (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId)
account (id, accountId, providerId, userId, accessToken, refreshToken, password, ...)

-- 验证表
verification (id, identifier, value, expiresAt, createdAt, updatedAt)
passwordResetToken (id, userId, token, expiresAt, createdAt)

-- 其他
newsletterSubscription (id, email, userId, status, unsubscribeToken, subscribedAt, ...)
```

完整 Schema 定义: `src/lib/db/schema.ts`

## 常用开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 数据库操作
pnpm db:generate    # 生成 Drizzle 迁移文件
pnpm db:migrate     # 执行数据库迁移
pnpm db:push        # 推送 schema 到数据库 (开发环境)
pnpm db:studio      # 启动 Drizzle Studio 数据库管理界面

# 管理员工具
pnpm admin:setup    # 创建管理员账户

# 博客清单生成
pnpm generate:blog-manifest
```

## 环境变量配置

**必需的环境变量** (参考 `.env.example`):

```env
# 数据库
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="至少32字符的随机密钥"
BETTER_AUTH_URL="http://localhost:3000"

# Resend 邮件
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="Your App <noreply@yourdomain.com>"

# 应用 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**可选的环境变量**:
```env
# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# R2/S3 存储
STORAGE_ACCESS_KEY_ID="..."
STORAGE_SECRET_ACCESS_KEY="..."
STORAGE_ENDPOINT="..."
STORAGE_BUCKET_NAME="..."
STORAGE_PUBLIC_URL="..."

# 分析工具
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="..."
NEXT_PUBLIC_CLARITY_PROJECT_ID="..."
```

## 国际化 (i18n)

- 框架: `next-intl`
- 支持语言: 英文 (`en`), 中文 (`zh`)
- 翻译文件: `messages/en.json`, `messages/zh.json` (含 UI 文本和 SEO 配置)
- 路由格式: `/en/...`, `/zh/...`

**添加新语言**:
1. 复制 `messages/en.json` 到 `messages/新语言代码.json`
2. 翻译 JSON 文件内容
3. 更新 `i18n.config.ts` 添加新语言代码

## 路由权限控制

- **公开路由**: `(marketing)`, `(auth)`
- **受保护路由**: `(protected)` - 需要登录，通过 `SessionGuard` 组件保护
- **管理员路由**: `(admin)` - 需要 `role='admin'`，通过 `AdminGuard` 组件保护

## 认证流程

### 注册流程
1. 用户填写注册表单
2. 创建用户和账户记录
3. 发送验证邮件
4. 用户点击链接验证邮箱

### 密码重置流程
1. 用户输入邮箱
2. 生成重置令牌存入 `passwordResetToken` 表
3. 发送重置邮件
4. 用户点击链接设置新密码

## 管理后台

管理员权限通过 `user.role = 'admin'` 标识。

**功能**:
- 用户列表和搜索
- 查看用户详情
- 修改用户角色
- 禁用/解禁用户

**创建管理员账户**:
```bash
pnpm admin:setup
# 或手动在数据库中将 user.role 设为 'admin'
```

## 部署清单

1. **环境准备**
   - PostgreSQL 数据库 (推荐 Supabase/Neon/Vercel Postgres)
   - Resend API Key (https://resend.com)
   - (可选) Google OAuth 凭据
   - (可选) R2/S3 存储配置

2. **数据库初始化**
   ```bash
   pnpm db:push
   ```

3. **创建管理员账户**
   ```bash
   pnpm admin:setup
   ```

4. **环境变量检查**
   确保 `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_FROM_EMAIL` 使用正确的域名。

## 扩展指南

### 添加新功能模块
1. 在 `src/features/` 下创建新目录
2. 包含 `components/`, `actions/`, `schemas.ts` 等
3. 在 `src/app/` 下创建对应路由

### 添加新数据库表
1. 在 `src/lib/db/schema.ts` 定义新表
2. 运行 `pnpm db:generate` 生成迁移
3. 运行 `pnpm db:push` 或 `pnpm db:migrate` 应用更改

### 自定义邮件模板
编辑 `src/emails/` 目录下的 React Email 组件

## 相关文档

- [Better Auth 文档](https://better-auth.com/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Next.js 文档](https://nextjs.org/docs)
- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [Resend 文档](https://resend.com/docs)
