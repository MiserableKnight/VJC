import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const MAX_REQUESTS = 100; // 每分钟最大请求数

interface RequestRecord {
  count: number;
  resetAt: number;
}

// 简单的内存存储，生产环境应使用Redis等分布式存储
const ipRequestMap = new Map<string, RequestRecord>();

export function rateLimit(req: NextRequest) {
  // 从请求头获取IP地址
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  
  // 获取当前IP的请求记录
  let record = ipRequestMap.get(ip);
  
  // 如果记录不存在或已过期，创建新记录
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
    ipRequestMap.set(ip, record);
  }
  
  // 增加请求计数
  record.count++;
  
  // 如果超过限制，返回429错误
  if (record.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  // 清理过期记录（周期性操作，避免内存泄漏）
  if (ipRequestMap.size > 10000) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (now > val.resetAt) {
        ipRequestMap.delete(key);
      }
    }
  }
  
  return null; // 继续正常请求
} 