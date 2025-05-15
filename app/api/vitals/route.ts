'use server';

import { NextResponse } from 'next/server';

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
 * 在Vercel部署中，文件系统是只读的，因此不进行文件写入
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
    
    // 记录到控制台，但不写入文件
    console.log(`Web Vitals数据已记录: ${vitalsData.name} (${vitalsData.rating})`);
    
    // 在Vercel环境中，可以考虑将数据发送到分析服务
    // 例如Vercel Analytics、Google Analytics或自定义分析平台
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('处理Web Vitals数据失败:', error);
    return NextResponse.json(
      { success: false, error: '处理Web Vitals数据失败' },
      { status: 500 }
    );
  }
} 