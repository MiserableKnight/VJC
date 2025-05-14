'use client';

import useSWR, { SWRConfiguration } from 'swr';

// 通用数据获取器
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  return res.json();
};

/**
 * 使用SWR进行数据获取和缓存的自定义Hook
 * @param url API请求URL
 * @param options SWR配置选项
 * @returns 包含数据、错误状态、加载状态和重新验证方法的对象
 */
export function useSwrFetch<T>(url: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url, 
    fetcher, 
    { 
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 10000, // 10秒内相同请求会被去重
      ...options
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate
  };
} 