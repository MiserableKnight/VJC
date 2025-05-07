import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // 可以在这里添加任何需要暴露给前端的环境变量
    // 数据库凭据不应该暴露给前端
    APP_ENV: process.env.NODE_ENV || 'development'
  }
};

export default nextConfig;
