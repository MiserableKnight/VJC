'use server';

import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface AnalyticsEvent {
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  url?: string;
  referrer?: string;
  extra?: Record<string, any>;
}

/**
 * 处理用户行为分析事件的API路由
 */
export async function POST(request: Request) {
  try {
    // 获取请求body
    const eventData = await request.json() as AnalyticsEvent;
    
    // 添加服务器时间戳
    const logEntry = {
      ...eventData,
      serverTimestamp: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // 构建日志文件名，按事件类型和日期分割日志
    const today = new Date().toISOString().split('T')[0];
    const eventType = eventData.eventType.toLowerCase();
    const logFileName = `analytics-${eventType}-${today}.log`;
    const logDir = path.join(process.cwd(), 'logs', 'analytics');
    const logPath = path.join(logDir, logFileName);
    
    // 确保日志目录存在
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      console.error('创建分析日志目录失败:', err);
    }
    
    // 写入日志文件
    try {
      await fs.appendFile(
        logPath, 
        JSON.stringify(logEntry) + '\n', 
        { flag: 'a+' }
      );
      
      // 不要在生产环境打印敏感信息
      console.log(`分析事件已记录: ${eventData.eventType} - ${eventData.action}`);
    } catch (err) {
      console.error('写入分析日志文件失败:', err);
    }
    
    // 只保留过去30天的日志文件
    try {
      const files = await fs.readdir(logDir);
      const analyticsLogs = files.filter(file => 
        file.startsWith('analytics-') && file.endsWith('.log')
      );
      
      // 计算30天前的日期
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      // 删除过旧的日志文件
      for (const file of analyticsLogs) {
        const dateMatch = file.match(/analytics-\w+-(\d{4}-\d{2}-\d{2})\.log/);
        if (dateMatch && dateMatch[1] < cutoffDate) {
          await fs.unlink(path.join(logDir, file));
          console.log(`删除过期分析日志文件: ${file}`);
        }
      }
    } catch (err) {
      console.error('清理旧分析日志文件失败:', err);
    }
    
    // 如果是高价值事件，可以立即进行一些处理
    if (eventData.category === 'CONVERSION') {
      // 在这里可以添加特殊处理逻辑，如发送通知或触发其他系统
      console.log(`检测到转化事件: ${eventData.action} - ${eventData.label}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('处理分析事件失败:', error);
    return NextResponse.json(
      { success: false, error: '处理分析事件失败' },
      { status: 500 }
    );
  }
} 