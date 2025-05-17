/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    // 可以在这里添加任何需要暴露给前端的环境变量
    // 数据库凭据不应该暴露给前端
    APP_ENV: process.env.NODE_ENV || 'development'
  },
  // 输出独立部署模式
  output: "standalone",
  
  // 已移除过时的dynamicParams配置
  
  experimental: {
    webVitalsAttribution: [],
  },
  
  // 添加安全性配置
  async headers() {
    return [
      // API的CORS配置
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' } // 24小时
        ]
      },
      // 全站的CSP策略
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.open-meteo.com; font-src 'self' data: https:; frame-ancestors 'none';"
          },
          // 添加其他安全头
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 