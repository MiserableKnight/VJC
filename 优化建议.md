This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 环境变量配置

在运行应用前，请先配置数据库连接信息：

1. 在项目根目录创建一个`.env.local`文件（该文件已被添加到`.gitignore`，不会被提交到版本控制系统）
2. 添加以下内容，并替换为你的实际数据库连接信息：

```bash
# 数据库连接配置
DB_HOST=your-db-host.example.com
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_secure_password
DB_SCHEMA=public
DB_TABLE=op_data

# SSL配置
DB_SSL_REJECT_UNAUTHORIZED=true
```

⚠️ **安全提示**：
- 绝不要在代码或配置文件中硬编码数据库密码
- 确保`.env.local`文件不会被提交到版本控制系统
- 在生产环境中，使用安全的方法设置环境变量，而不是文件

### 运行开发服务器

配置好环境变量后，运行开发服务器：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 数据库安全最佳实践

本项目采用以下数据库安全最佳实践：

1. **环境变量**：所有敏感信息通过环境变量传递，而不是硬编码
2. **参数化查询**：所有SQL查询都使用参数化查询防止SQL注入
3. **最小权限原则**：建议为应用创建专用的数据库用户，只授予必要的权限
4. **安全日志**：日志中不记录敏感信息
5. **错误处理**：向客户端返回通用错误消息，不泄露系统细节
