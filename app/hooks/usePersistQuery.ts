'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// 查询数据缓存配置
export interface QueryCacheConfig {
  key: string;        // 缓存键
  version?: number;   // 缓存版本（用于检测和重置过期缓存）
  maxAge?: number;    // 最大缓存期限（毫秒）
}

// 查询缓存项类型
interface QueryCacheItem<T> {
  data: T;                   // 缓存的数据
  timestamp: number;         // 缓存时间戳
  version: number;           // 缓存版本
  lastUpdateId?: string;     // 最后更新ID（用于增量更新）
}

/**
 * 持久化查询结果的钩子
 * 支持缓存版本控制、过期清理和增量更新
 */
export function usePersistQuery<T>(config: QueryCacheConfig) {
  const {
    key,
    version = 1,
    maxAge = 24 * 60 * 60 * 1000, // 默认24小时
  } = config;

  // 创建一个本地存储键，包含版本信息
  const storageKey = `query_cache_${key}`;

  // 使用本地存储保存查询结果
  const [cache, setCache, clearCache] = useLocalStorage<QueryCacheItem<T> | null>(
    storageKey,
    null
  );

  // 检查缓存是否有效
  const isCacheValid = useCallback(() => {
    if (!cache) return false;

    // 检查版本
    if (cache.version !== version) return false;

    // 检查是否过期
    if (maxAge > 0) {
      const now = Date.now();
      const age = now - cache.timestamp;
      if (age > maxAge) return false;
    }

    return true;
  }, [cache, version, maxAge]);

  // 获取缓存数据
  const getCachedData = useCallback(() => {
    if (isCacheValid()) {
      return cache?.data;
    }
    return null;
  }, [cache, isCacheValid]);

  // 获取最后更新ID（用于增量更新）
  const getLastUpdateId = useCallback(() => {
    if (isCacheValid()) {
      return cache?.lastUpdateId;
    }
    return undefined;
  }, [cache, isCacheValid]);

  // 保存完整查询结果
  const saveQueryResult = useCallback((data: T, updateId?: string) => {
    const cacheItem: QueryCacheItem<T> = {
      data,
      timestamp: Date.now(),
      version,
      lastUpdateId: updateId
    };
    setCache(cacheItem);
  }, [setCache, version]);

  // 使用增量更新
  const updateQueryResult = useCallback((
    updateFn: (currentData: T) => T,
    updateId?: string
  ) => {
    if (isCacheValid() && cache?.data) {
      const updatedData = updateFn(cache.data);
      saveQueryResult(updatedData, updateId);
      return true;
    }
    return false;
  }, [cache, isCacheValid, saveQueryResult]);

  // 合并增量数据
  const mergeIncrementalData = useCallback(<U>(
    baseData: T | null,
    incrementalData: U,
    mergeFn: (base: T | null, increment: U) => T
  ) => {
    const result = mergeFn(baseData, incrementalData);
    saveQueryResult(result);
    return result;
  }, [saveQueryResult]);

  return {
    // 获取缓存的数据
    getCachedData,
    // 检查缓存是否有效
    isCacheValid,
    // 保存查询结果
    saveQueryResult,
    // 更新现有结果
    updateQueryResult,
    // 获取最后更新ID
    getLastUpdateId,
    // 合并增量数据
    mergeIncrementalData,
    // 清除缓存
    clearCache
  };
} 