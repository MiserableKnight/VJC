/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许从局域网内其他设备访问开发服务器
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;

// 引入配置目录下的Next.js配置
// 本地开发服务器启动方式:
// npm run dev -- -H 0.0.0.0
// 然后在手机浏览器上访问: http://192.168.14.230:3000
module.exports = require('./config/next/next.config.js'); 