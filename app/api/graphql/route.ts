import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { schema } from '../../graphql/schema';
import { isProduction } from '../../config/env';

// 创建Apollo Server实例
const server = new ApolloServer({
  schema,
  introspection: !isProduction(),
});

// 为Next.js App Router创建处理程序
const handler = startServerAndCreateNextHandler(server, {
  // 可选：添加上下文
  // context: async (req, res) => ({
  //   req,
  //   res,
  //   // 可以在这里添加其他上下文对象
  // }),
});

// 处理GET和POST请求
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

// CORS和其他配置会由Next.js和@as-integrations/next自动处理 