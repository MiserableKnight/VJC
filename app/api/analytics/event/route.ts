'use server';

import { NextResponse } from 'next/server';

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
 * 在Vercel部署中，文件系统是只读的，因此不进行文件写入
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
    
    // 记录到控制台，但不写入文件
    console.log(`分析事件已记录: ${eventData.eventType} - ${eventData.action}`);
    
    // 在Vercel环境中，可以考虑将数据发送到分析服务
    // 例如Vercel Analytics、Google Analytics或自定义分析平台
    
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