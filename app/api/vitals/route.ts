'use server';

import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Web Vitals性能指标数据类型
 */
interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType?: string;
  path?: string;
  userAgent?: string;
  timestamp: number;
}

/**
 * 处理Web Vitals性能指标数据的API路由
 */
export async function POST(request: Request) {
  try {
    // 获取请求body
    const vitalsData = await request.json() as WebVitalsMetric;
    
    // 添加服务器时间戳
    const logEntry = {
      ...vitalsData,
      serverTimestamp: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || 'unknown'
    };
    
    // 构建日志文件名，按指标类型和日期分割日志
    const today = new Date().toISOString().split('T')[0];
    const metricName = (vitalsData.name || 'unknown').toLowerCase();
    const logFileName = `vitals-${metricName}-${today}.log`;
    const logDir = path.join(process.cwd(), 'logs', 'vitals');
    const logPath = path.join(logDir, logFileName);
    
    // 确保日志目录存在
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      console.error('创建性能指标日志目录失败:', err);
    }
    
    // 写入日志文件
    try {
      await fs.appendFile(
        logPath, 
        JSON.stringify(logEntry) + '\n', 
        { flag: 'a+' }
      );
      
      // 如果是性能不佳的指标，记录到单独的文件中
      if (vitalsData.rating === 'poor') {
        const poorMetricsPath = path.join(logDir, `poor-metrics-${today}.log`);
        await fs.appendFile(
          poorMetricsPath,
          JSON.stringify(logEntry) + '\n',
          { flag: 'a+' }
        );
      }
      
      console.log(`Web Vitals数据已记录: ${vitalsData.name} (${vitalsData.rating})`);
    } catch (err) {
      console.error('写入Web Vitals日志文件失败:', err);
    }
    
    // 只保留过去14天的日志文件
    try {
      const files = await fs.readdir(logDir);
      const vitalsLogs = files.filter(file => 
        (file.startsWith('vitals-') || file.startsWith('poor-metrics-')) && 
        file.endsWith('.log')
      );
      
      // 计算14天前的日期
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const cutoffDate = fourteenDaysAgo.toISOString().split('T')[0];
      
      // 删除过旧的日志文件
      for (const file of vitalsLogs) {
        const dateMatch = file.match(/\d{4}-\d{2}-\d{2}\.log$/);
        if (dateMatch && dateMatch[0].slice(0, 10) < cutoffDate) {
          await fs.unlink(path.join(logDir, file));
          console.log(`删除过期Web Vitals日志文件: ${file}`);
        }
      }
    } catch (err) {
      console.error('清理旧Web Vitals日志文件失败:', err);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('处理Web Vitals数据失败:', error);
    return NextResponse.json(
      { success: false, error: '处理Web Vitals数据失败' },
      { status: 500 }
    );
  }
} 