'use client';

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';

// 通用数据获取器
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  return res.json();
};

/**
 * 使用React Query进行数据获取和缓存的自定义Hook
 * @param queryKey 查询的唯一键（用于缓存标识）
 * @param url API请求URL
 * @param options React Query配置选项
 * @returns React Query查询结果
 */
export function useQueryFetch<T>(
  queryKey: string | string[],
  url: string | null,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => url ? fetcher<T>(url) : Promise.reject('URL不能为空'),
    staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
    gcTime: 30 * 60 * 1000, // 缓存保留30分钟
    refetchOnWindowFocus: false,
    retry: 2,
    ...options
  });
} 