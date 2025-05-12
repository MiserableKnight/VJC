import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isProduction } from '../../../config/env';

/**
 * 处理错误日志的API路由
 */
export async function POST(request: Request) {
  try {
    const errorLog = await request.json();
    
    // 添加服务器端时间戳
    errorLog.serverTimestamp = Date.now();
    
    // 简单的日志格式化
    const formattedLog = `[${new Date(errorLog.timestamp).toISOString()}] [${errorLog.type}] [${errorLog.severity}] ${errorLog.message}\n`;
    
    // 在开发环境中，将日志打印到控制台
    if (!isProduction()) {
      console.error('收到错误日志:', errorLog);
    }
    
    // 在实际应用中，这里可以连接到数据库或第三方日志服务
    // 例如 MongoDB, Sentry, LogRocket, 等
    
    // 示例：在开发环境中将日志保存到文件
    if (!isProduction()) {
      try {
        const logsDir = path.join(process.cwd(), 'logs');
        
        // 确保日志目录存在
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }
        
        // 按日期为日志文件命名
        const today = new Date().toISOString().split('T')[0];
        const logFilePath = path.join(logsDir, `errors-${today}.log`);
        
        // 追加日志到文件
        fs.appendFileSync(
          logFilePath,
          `${formattedLog}${errorLog.stack ? `Stack: ${errorLog.stack}\n` : ''}${'-'.repeat(80)}\n`
        );
      } catch (fileError) {
        console.error('无法写入日志文件:', fileError);
      }
    }
    
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