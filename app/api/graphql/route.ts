import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest, NextResponse } from 'next/server';
import { schema } from '../../graphql/schema';
import { isProduction } from '../../config/env';

// 创建Apollo Server实例
const server = new ApolloServer({
  schema,
  introspection: !isProduction(),
  formatError: (formattedError, error) => {
    // 记录详细错误信息
    console.error('GraphQL错误:', error);
    
    // 在生产环境中隐藏详细错误信息
    if (isProduction()) {
      return { 
        message: '处理请求出错',
        extensions: {
          code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
        }
      };
    }
    
    // 开发环境返回完整错误信息
    return formattedError;
  },
});

// 为Next.js App Router创建处理程序
const handler = startServerAndCreateNextHandler(server, {
  // 可选：添加上下文
  context: async (req) => ({
    req,
    // 可以在这里添加其他上下文对象
  }),
});

// 处理OPTIONS请求以支持CORS预检
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Apollo-Require-Preflight',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理GET和POST请求
export async function GET(request: NextRequest) {
  try {
    // 由于GraphQL主要使用POST，GET请求可能是健康检查或内省查询
    return await handler(request);
  } catch (error) {
    console.error('GraphQL GET请求处理错误:', error);
    return NextResponse.json(
      { errors: [{ message: '处理请求出错' }] },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 处理GraphQL POST请求
    return await handler(request);
  } catch (error) {
    console.error('GraphQL POST请求处理错误:', error);
    return NextResponse.json(
      { errors: [{ message: '处理请求出错' }] },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// CORS和其他配置会由Next.js和@as-integrations/next自动处理 