'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';

// 记录最后更新时间的键前缀
const LAST_UPDATE_PREFIX = 'last_update_';

/**
 * 为API请求添加增量更新参数的函数
 * @param baseUrl 基础URL
 * @param resourceKey 资源标识符（用于存储上次更新时间）
 * @param forceFullSync 是否强制完整同步
 * @returns 带有增量参数的URL
 */
export function getIncrementalUrl(
  baseUrl: string,
  resourceKey: string,
  forceFullSync: boolean = false
): string {
  // 如果在服务器端则返回完整URL
  if (typeof window === 'undefined') {
    return baseUrl;
  }

  // 如果强制完整同步，则清除上次更新时间并返回基础URL
  if (forceFullSync) {
    localStorage.removeItem(`${LAST_UPDATE_PREFIX}${resourceKey}`);
    return baseUrl;
  }

  // 尝试获取上次更新时间
  const lastUpdateTime = localStorage.getItem(`${LAST_UPDATE_PREFIX}${resourceKey}`);
  
  // 如果没有上次更新时间，返回基础URL
  if (!lastUpdateTime) {
    return baseUrl;
  }

  // 添加上次更新时间作为参数
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}since=${encodeURIComponent(lastUpdateTime)}`;
}

/**
 * 更新最后同步时间的函数
 * @param resourceKey 资源标识符
 * @param timestamp 时间戳（如果未提供则使用当前时间）
 */
export function updateLastSyncTime(
  resourceKey: string, 
  timestamp: string = new Date().toISOString()
): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(`${LAST_UPDATE_PREFIX}${resourceKey}`, timestamp);
}

/**
 * 使用增量更新的自定义Hook
 * @param resourceKey 资源标识符
 * @param baseUrl 基础URL
 * @returns [增量更新URL, 更新最后同步时间函数, 重置（强制完整同步）函数]
 */
export function useIncrementalUpdate(
  resourceKey: string,
  baseUrl: string
): [string, (timestamp?: string) => void, () => void] {
  const storageKey = `${LAST_UPDATE_PREFIX}${resourceKey}`;
  const [lastUpdate, setLastUpdate] = useLocalStorage<string | null>(storageKey, null);
  
  // 构建URL
  const url = lastUpdate
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}since=${encodeURIComponent(lastUpdate)}`
    : baseUrl;
  
  // 更新最后同步时间
  const updateSyncTime = (timestamp?: string) => {
    const newTimestamp = timestamp || new Date().toISOString();
    setLastUpdate(newTimestamp);
  };
  
  // 重置函数（强制完整同步）
  const reset = () => {
    setLastUpdate(null);
  };
  
  return [url, updateSyncTime, reset];
} 