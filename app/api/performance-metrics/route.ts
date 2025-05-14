'use server';

import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface PerformanceMetrics {
  id: string;
  metrics: {
    renderTime?: number;
    longTasks?: Array<{duration: number, startTime: number}>;
    fps?: number;
    memoryUsage?: number;
  };
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * 处理性能指标数据的API路由
 * 接收来自客户端的性能指标数据并保存到日志文件
 */
export async function POST(request: Request) {
  try {
    // 获取请求body
    const data = await request.json() as PerformanceMetrics;
    
    // 添加服务器时间戳
    const logEntry = {
      ...data,
      serverTimestamp: new Date().toISOString()
    };
    
    // 构建日志文件名，按日期分割日志
    const today = new Date().toISOString().split('T')[0];
    const logFileName = `performance-${today}.log`;
    const logDir = path.join(process.cwd(), 'logs');
    const logPath = path.join(logDir, logFileName);
    
    // 确保日志目录存在
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      console.error('创建日志目录失败:', err);
    }
    
    // 写入日志文件
    try {
      await fs.appendFile(
        logPath, 
        JSON.stringify(logEntry) + '\n', 
        { flag: 'a+' }
      );
      
      console.log(`性能数据已记录到 ${logPath}`);
    } catch (err) {
      console.error('写入性能日志文件失败:', err);
    }
    
    // 只保留过去7天的日志文件
    try {
      const files = await fs.readdir(logDir);
      const performanceLogs = files.filter(file => 
        file.startsWith('performance-') && file.endsWith('.log')
      );
      
      // 计算7天前的日期
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
      
      // 删除过旧的日志文件
      for (const file of performanceLogs) {
        const dateMatch = file.match(/performance-(\d{4}-\d{2}-\d{2})\.log/);
        if (dateMatch && dateMatch[1] < cutoffDate) {
          await fs.unlink(path.join(logDir, file));
          console.log(`删除过期日志文件: ${file}`);
        }
      }
    } catch (err) {
      console.error('清理旧日志文件失败:', err);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('处理性能指标数据失败:', error);
    return NextResponse.json(
      { success: false, error: '处理性能指标数据失败' },
      { status: 500 }
    );
  }
} 