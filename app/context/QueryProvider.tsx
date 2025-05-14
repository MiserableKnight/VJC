'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 暂时注释掉 DevTools，避免导入问题
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * 创建并配置QueryClient
 */
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5分钟
      gcTime: 1800000, // 30分钟
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
  // 是否开启开发工具，默认在开发环境启用
  enableDevTools?: boolean;
}

/**
 * React Query 提供者组件
 * 为整个应用提供数据获取和缓存功能
 */
export default function QueryProvider({ 
  children, 
  enableDevTools = false // 默认关闭开发工具
}: QueryProviderProps) {
  // 创建一个客户端实例，确保在组件重新渲染时不会重建
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 暂时注释掉 DevTools，避免导入问题 */}
      {/* {enableDevTools && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
} 