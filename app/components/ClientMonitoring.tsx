'use client';

import { useEffect } from 'react';
import initMonitoring, { monitorAppLoad } from '../monitoring';

/**
 * 客户端监控组件
 * 在客户端加载时初始化监控系统
 */
export default function ClientMonitoring() {
  useEffect(() => {
    // 初始化监控系统
    initMonitoring();
    
    // 监控应用程序加载性能
    monitorAppLoad('vjc-dashboard');
  }, []);

  // 这是一个无渲染组件
  return null;
} 