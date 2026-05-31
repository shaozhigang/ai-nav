# Resend 邮件配置指南

本文档说明如何在 [Resend](https://resend.com) 中配置邮件服务，涵盖本地开发与生产环境域名验证。

项目使用 Resend 发送**事务邮件**（注册验证、密码重置等），相关代码见 `src/lib/email.ts`。

---

## 环境变量一览

| 变量 | 是否必需 | 说明 |
|------|----------|------|
| `RESEND_API_KEY` | ✅ 必需 | Resend API 密钥，形如 `re_xxxx` |
| `RESEND_FROM_EMAIL` | 推荐 | 完整发件地址，格式：`显示名 <email@domain.com>` |
| `RESEND_VERIFIED_DOMAIN` | 生产可选 | 已验证的域名，未设置 `RESEND_FROM_EMAIL` 时用于自动拼接发件地址 |
| `RESEND_FROM_NAME` | 可选 | 发件显示名称，默认 `Toolso.AI` |
| `RESEND_AUDIENCE_ID` | 可选 | Newsletter 受众 ID，**当前项目未使用** |

---

## 发件地址优先级

`src/lib/email.ts` 中发件地址按以下顺序确定：

1. **`RESEND_FROM_EMAIL`** — 若已配置，直接使用（优先级最高）
2. **开发环境** — 未配置时自动使用 `Toolso.AI <onboarding@resend.dev>`
3. **生产环境** — 使用 `RESEND_VERIFIED_DOMAIN` 拼接为 `noreply@你的域名`

> ⚠️ 请勿使用 `.env.example` 中的占位符 `noreply@yourdomain.com`，该域名未在 Resend 验证会导致邮件无法发出。

---

## 一、本地开发配置

本地开发**不需要**在 Resend 中添加域名（Domains 页面可以为空）。

### 1. 获取 API Key

1. 注册并登录 [Resend](https://resend.com)
2. 左侧 **API Keys** → **Create API Key**
3. 复制密钥（形如 `re_xxxx`）

### 2. 配置 `.env`

```env
RESEND_API_KEY="re_你的密钥"
RESEND_FROM_EMAIL="Toolso.AI <onboarding@resend.dev>"
```

也可以**注释或删除** `RESEND_FROM_EMAIL`，开发环境会自动使用 `onboarding@resend.dev`。

### 3. 开发环境限制

使用 `onboarding@resend.dev` 测试发件地址时：

- **免费账号只能发送到你在 Resend 注册时使用的邮箱**
- 网站注册邮箱必须与 Resend 账号邮箱一致

例如 Resend 账号为 `you@gmail.com`，则本地测试时也应用 `you@gmail.com` 注册。

### 4. 重启开发服务器

修改 `.env` 后需重启：

```bash
pnpm dev
```

环境变量不会热更新。

---

## 二、生产环境：验证域名

要向上线用户发送邮件（任意收件人），必须验证自己的域名。

### 第 1 步：在 Resend 添加域名

1. 登录 Resend 控制台
2. 左侧 **Domains** → **+ Add domain**
3. 输入根域名，例如 `toolso.ai`（不要带 `www`）
4. 选择区域（Region），一般选离用户最近的区域

### 第 2 步：添加 DNS 记录

Resend 会给出需要添加的 DNS 记录，通常包括：

| 类型 | 用途 |
|------|------|
| **MX** | 邮件路由 |
| **TXT** | SPF 验证 |
| **CNAME** | DKIM 签名（可能有多条） |

到你的域名 DNS 管理面板（Cloudflare、阿里云、腾讯云、Namecheap 等）**原样添加** Resend 提供的记录。

### 第 3 步：等待验证通过

- DNS 生效通常需要 **几分钟到几小时**
- 回到 Resend **Domains** 页面，状态变为 **Verified**（绿色）即表示成功

### 第 4 步：配置生产环境变量

**方式 A — 直接指定发件地址（推荐）：**

```env
RESEND_API_KEY="re_你的密钥"
RESEND_FROM_EMAIL="Toolso.AI <noreply@toolso.ai>"
```

邮箱前缀可自定义，常见有 `noreply@`、`hello@`、`support@`，只要 `@toolso.ai` 域名已在 Resend 验证即可。

**方式 B — 通过域名自动拼接：**

```env
RESEND_API_KEY="re_你的密钥"
RESEND_VERIFIED_DOMAIN="toolso.ai"
RESEND_FROM_NAME="Toolso.AI"
```

代码会自动生成 `Toolso.AI <noreply@toolso.ai>`。

### 第 5 步：部署到生产环境

将上述变量配置到 Vercel、Cloudflare Pages、服务器等**部署平台的环境变量**中，不要只改本地 `.env`。

同时确保生产环境的 `BETTER_AUTH_URL` 和 `NEXT_PUBLIC_APP_URL` 使用真实域名。

---

## 三、配置场景对照

| 场景 | 是否需要 Add domain | `RESEND_FROM_EMAIL` |
|------|---------------------|---------------------|
| 本地开发 | ❌ 不需要 | `Toolso.AI <onboarding@resend.dev>` 或不填 |
| 生产上线 | ✅ 需要并验证 DNS | `Toolso.AI <noreply@你的域名>` |

---

## 四、如何确认邮件发送成功

### 1. 本地终端日志

运行 `pnpm dev` 的终端中，发送失败时会看到：

```
Failed to send email: ...
```

接口返回 200 不代表邮件一定送达，需结合 Resend 控制台确认。

### 2. Resend 控制台 — Emails

1. 左侧 **Emails**
2. 查看是否有发送记录
3. 点击单条邮件，查看状态：**Delivered** / **Bounced** / **Failed**

### 3. Resend 控制台 — Logs

1. 左侧 **Logs**
2. 查看 API 请求是否成功及错误详情

---

## 五、常见问题

### 界面显示「发送成功」但收不到邮件

1. 检查 `RESEND_FROM_EMAIL` 是否为占位符 `noreply@yourdomain.com`
2. 开发环境确认注册邮箱 = Resend 账号邮箱
3. 查看 Resend **Emails** 页面是否有记录及失败原因
4. 检查垃圾邮件文件夹

### 开发阶段绕过邮件验证

在 Drizzle Studio（`pnpm db:studio`）中：

1. 打开 `user` 表，找到对应账号
2. 将 `emailVerified` 设为 `true`

或从 `verification` 表复制 `value`（token），手动访问：

```
http://localhost:3000/verify-email?token=这里粘贴token
```

---

## 六、关于 `RESEND_AUDIENCE_ID`

`RESEND_AUDIENCE_ID` 用于 Resend 的 **Audience / Segment**（Newsletter 营销邮件联系人列表），**与注册验证、密码重置等事务邮件无关**。

当前项目代码**未读取**此变量，可以不配置。

Resend 已将旧版 Audiences 迁移为 Segments，新版 Contacts API 创建联系人时不再需要 `audienceId`。若将来实现 Newsletter 功能，建议参考 [Resend Segments 文档](https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments)。

如需查询 Audience ID（旧 API），可调用：

```bash
curl -X GET "https://api.resend.com/audiences" \
  -H "Authorization: Bearer re_你的密钥"
```

返回 JSON 中 `data[].id` 即为 Audience ID。

---

## 相关文档

- [本地开发指南](./local-development.md)
- [`.env.example`](../.env.example) — 完整环境变量模板
- [Resend 官方文档](https://resend.com/docs)
- [Resend Domains 文档](https://resend.com/docs/dashboard/domains/introduction)
