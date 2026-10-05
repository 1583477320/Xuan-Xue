# 部署到 Vercel + Neon 指南

## 1. 准备工作

### 1.1 创建 Neon 数据库（免费）
1. 访问 https://neon.tech 注册账号
2. 创建新项目，选择 Free Tier
3. 复制连接字符串（包含 SSL）

### 1.2 创建 Vercel 项目
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 2. 配置环境变量

在 Vercel 控制台的 Project Settings → Environment Variables 添加：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | Neon 数据库连接串 | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 生产环境 URL | `https://your-app.vercel.app` |

## 3. 数据库迁移

Neon 会自动执行 schema.prisma 中的模型定义。

如果需要手动迁移：
```bash
# 本地测试
bun prisma db push

# 生产环境迁移
npx prisma migrate deploy
```

## 4. 部署后验证

访问 `https://your-app.vercel.app/api/` 应返回 JSON 响应。

## 注意事项

- Neon Free Tier: 512MB 存储，自动休眠（30天无活动）
- 首次访问会唤醒数据库，可能有 5-10 秒延迟
- Vercel Free Tier: 100GB 带宽/月
