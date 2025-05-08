/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    // 可以在这里添加任何需要暴露给前端的环境变量
    // 数据库凭据不应该暴露给前端
    APP_ENV: process.env.NODE_ENV || 'development'
  },
  // 配置字体加载
  optimizeFonts: false,
  // 禁用遥测和跟踪
  telemetry: { 
    disabled: true 
  },
  // 禁用一些实验性功能的跟踪
  experimental: {
    webVitalsAttribution: []
  }
};

module.exports = nextConfig; 