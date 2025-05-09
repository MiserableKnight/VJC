/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    // 可以在这里添加任何需要暴露给前端的环境变量
    // 数据库凭据不应该暴露给前端
    APP_ENV: process.env.NODE_ENV || 'development'
  },
  // 移除不支持的配置项
  // optimizeFonts: false, - 已移除
  // telemetry: { 
  //   disabled: true 
  // }, - 已移除
  experimental: {
    webVitalsAttribution: []
  }
};

module.exports = nextConfig; 