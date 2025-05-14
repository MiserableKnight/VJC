import { NextResponse } from 'next/server';
import { DateRangeSchema, validateRequestBody } from '../../lib/validators';
import { rateLimit } from '../middleware/rateLimit';
import { NextRequest } from 'next/server';

// GET请求处理
export async function GET(req: NextRequest) {
  // 应用速率限制
  const rateLimitResult = rateLimit(req);
  if (rateLimitResult) return rateLimitResult;
  
  // 处理请求...
  return NextResponse.json({
    message: '请求成功',
    data: {
      timestamp: new Date().toISOString()
    }
  });
}

// POST请求处理
export async function POST(req: NextRequest) {
  // 应用速率限制
  const rateLimitResult = rateLimit(req);
  if (rateLimitResult) return rateLimitResult;
  
  // 验证请求数据
  const validation = await validateRequestBody(req, DateRangeSchema);
  
  if (!validation.success) {
    return NextResponse.json({ 
      error: validation.error 
    }, { status: 400 });
  }
  
  // 处理已验证的数据
  const { startDate, endDate } = validation.data;
  
  try {
    // 这里是业务逻辑...
    return NextResponse.json({
      message: '日期处理成功',
      data: {
        startDate,
        endDate,
        daysBetween: Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error) {
    console.error('处理请求时出错:', error);
    return NextResponse.json({ 
      error: '内部服务器错误' 
    }, { status: 500 });
  }
} 