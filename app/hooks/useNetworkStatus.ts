'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatusOptions {
  onOnline?: () => void;
  onOffline?: () => void;
}

/**
 * 监控网络连接状态的钩子
 * 
 * @param options 配置选项，包含网络状态变化时的回调函数
 * @returns 包含网络状态和手动检查方法的对象
 */
export function useNetworkStatus(options: NetworkStatusOptions = {}) {
  const { onOnline, onOffline } = options;
  
  // 初始状态如果在服务器上则假设为在线
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // 网络速度估计 (仅在在线状态下有效)
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);
  
  // 连接类型 (仅在支持的浏览器中有效)
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  // 处理在线状态变化
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (onOnline) onOnline();
  }, [onOnline]);
  
  // 处理离线状态变化
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setNetworkSpeed(null);
    if (onOffline) onOffline();
  }, [onOffline]);
  
  // 估计网络速度
  const checkNetworkSpeed = useCallback(async () => {
    if (!isOnline) {
      setNetworkSpeed(null);
      return;
    }
    
    try {
      const startTime = Date.now();
      // 尝试获取一个小文件来测量速度 (可以替换为项目中的一个小静态资源)
      const response = await fetch('/api/ping', { 
        method: 'GET',
        cache: 'no-store' 
      });
      
      if (!response.ok) throw new Error('Network speed test failed');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 简单估算速度 (响应时间越短，速度越快)
      // 这是一个非常粗略的估计
      const estimatedSpeed = 1000 / duration; // 简单指标，不是真正的Mbps
      setNetworkSpeed(estimatedSpeed);
    } catch (error) {
      console.error('Network speed check failed:', error);
      setNetworkSpeed(null);
    }
  }, [isOnline]);
  
  // 检测连接类型
  const updateConnectionType = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || null);
      }
    } else {
      setConnectionType(null);
    }
  }, []);
  
  // 监听网络状态变化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 设置初始状态
    setIsOnline(navigator.onLine);
    updateConnectionType();
    
    // 添加事件监听器
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 监听连接变化 (仅在支持的浏览器中)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateConnectionType);
      }
    }
    
    // 定期检查网络速度 (每60秒)
    const speedCheckInterval = setInterval(() => {
      if (isOnline) checkNetworkSpeed();
    }, 60000);
    
    // 初始速度检查
    if (isOnline) checkNetworkSpeed();
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionType);
        }
      }
      
      clearInterval(speedCheckInterval);
    };
  }, [handleOnline, handleOffline, updateConnectionType, checkNetworkSpeed, isOnline]);
  
  // 手动重新检查网络状态
  const recheckNetwork = useCallback(() => {
    setIsOnline(navigator.onLine);
    updateConnectionType();
    if (navigator.onLine) checkNetworkSpeed();
  }, [updateConnectionType, checkNetworkSpeed]);
  
  return {
    isOnline,
    networkSpeed,
    connectionType,
    recheckNetwork
  };
}

export default useNetworkStatus; 