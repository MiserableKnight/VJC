import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './app/api/middleware/rateLimit';

// 定义匹配的路由
export const config = {
  matcher: '/api/:path*',
};

export function middleware(request: NextRequest) {
  // 检查是否为API请求
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 应用速率限制
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;
  }

  return NextResponse.next();
} 