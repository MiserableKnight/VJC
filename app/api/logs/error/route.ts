// 添加服务器组件标记
'use server';

import { NextResponse } from 'next/server';
import { isProduction } from '../../../config/env';

/**
 * 处理错误日志的API路由
 * 在Vercel部署中，文件系统是只读的，因此不进行文件写入
 */
export async function POST(request: Request) {
  try {
    const errorLog = await request.json();
    
    // 添加服务器端时间戳
    errorLog.serverTimestamp = Date.now();
    
    // 简单的日志格式化
    const formattedLog = `[${new Date(errorLog.timestamp).toISOString()}] [${errorLog.type}] [${errorLog.severity}] ${errorLog.message}`;
    
    // 记录到控制台
    console.error('收到错误日志:', formattedLog);
    
    // 在实际应用中，这里可以连接到数据库或第三方日志服务
    // 例如 MongoDB, Sentry, LogRocket, 等
    
    // 返回成功
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('处理错误日志时出错:', error);
    return NextResponse.json(
      { error: '处理日志失败' },
      { status: 500 }
    );
  }
} 