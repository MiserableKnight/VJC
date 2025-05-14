'use client';

import { useState, useEffect } from 'react';

/**
 * 使用localStorage或sessionStorage存储和检索数据的自定义Hook
 * @param key 存储键
 * @param initialValue 初始值
 * @param sessionOnly 是否仅在会话期间保存（使用sessionStorage）
 * @returns [存储的值, 设置值的函数, 移除值的函数]
 */
export function useStorage<T>(
  key: string, 
  initialValue: T, 
  sessionOnly: boolean = false
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 获取存储函数
  const getStorage = () => sessionOnly ? sessionStorage : localStorage;

  // 读取存储的值或使用初始值
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const storage = getStorage();
      const item = storage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`从存储读取键 "${key}" 时出错:`, error);
      return initialValue;
    }
  };

  // 状态来跟踪当前值
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 返回一个封装版本的useState的setter函数，将新值保存到localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`在非浏览器环境尝试设置localStorage键 "${key}"`);
      return;
    }

    try {
      // 允许值是一个函数，就像useState的setter
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // 保存到state
      setStoredValue(valueToStore);
      // 保存到localStorage
      const storage = getStorage();
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`保存状态到存储键 "${key}" 时出错:`, error);
    }
  };

  // 移除存储的值
  const removeValue = () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storage = getStorage();
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`从存储中移除键 "${key}" 时出错:`, error);
    }
  };

  // 监听其他窗口/标签更新存储的值
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== getStorage()) {
        return;
      }

      setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
    };

    // 监听存储更改事件
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 使用localStorage存储和检索数据的自定义Hook
 * @param key 存储键
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数, 移除值的函数]
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  return useStorage(key, initialValue, false);
}

/**
 * 使用sessionStorage存储和检索数据的自定义Hook
 * @param key 存储键
 * @param initialValue 初始值
 * @returns [存储的值, 设置值的函数, 移除值的函数]
 */
export function useSessionStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  return useStorage(key, initialValue, true);
} 