import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// 创建一个专用于健康检查的小型连接池
const healthCheckPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  },
  // 健康检查连接池配置
  max: 1, // 最多只需要一个连接
  idleTimeoutMillis: 10000, // 10秒后关闭空闲连接
  connectionTimeoutMillis: 5000 // 连接超时时间
});

export async function GET() {
  try {
    // 检查环境变量是否已配置
    const dbConfigured = process.env.DB_HOST && process.env.DB_PASSWORD;
    
    // 尝试连接数据库
    const startTime = Date.now();
    const result = await healthCheckPool.query('SELECT NOW()');
    const duration = Date.now() - startTime;

    // 返回健康检查结果
    return NextResponse.json({
      status: 'ok',
      database: true,
      dbConfigured: dbConfigured,
      time: result.rows[0].now,
      responseTime: `${duration}ms`,
      message: '数据库连接正常'
    });
  } catch (error) {
    console.error('健康检查失败 - 数据库连接错误', error);
    
    // 检查环境变量是否已配置
    const dbConfigured = process.env.DB_HOST && process.env.DB_PASSWORD;
    
    // 返回错误状态，但不泄露具体错误信息
    return NextResponse.json({
      status: 'error',
      database: false,
      dbConfigured: dbConfigured,
      message: '数据库连接失败，请检查配置'
    }, { status: 500 });
  }
} 