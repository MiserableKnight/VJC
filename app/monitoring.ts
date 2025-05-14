'use client';

import { isProduction } from './config/env';
import { initPerformanceMonitoring } from './utils/webVitals';
import { initAnalytics, setupClickTracking } from './utils/analyticsLogger';

/**
 * 初始化应用程序的错误、性能和分析监控系统
 */
export function initMonitoring() {
  if (typeof window === 'undefined') return;
  
  try {
    // 初始化性能监控
    initPerformanceMonitoring({
      reportTo: isProduction() ? 'api' : 'both',
      debug: !isProduction()
    });
    
    // 初始化用户行为分析
    initAnalytics();
    
    // 设置自动点击跟踪
    setupClickTracking();
    
    // 注册全局错误处理程序
    setupGlobalErrorHandlers();
    
    if (!isProduction()) {
      console.log('[监控] 初始化完成 - 性能监控和用户行为分析已激活');
    }
  } catch (error) {
    console.error('[监控] 初始化监控系统失败:', error);
  }
}

/**
 * 设置全局错误处理程序
 */
function setupGlobalErrorHandlers() {
  // 处理未捕获的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    console.error('[监控] 未处理的Promise拒绝:', error);
    
    // 记录错误到API
    logErrorToApi('unhandledrejection', error);
  });
  
  // 处理全局错误
  window.addEventListener('error', (event) => {
    // 避免重复记录资源加载错误
    if (event.error) {
      console.error('[监控] 全局错误:', event.error);
      
      // 记录错误到API
      logErrorToApi('global', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }
  });
}

/**
 * 将错误记录到API
 */
function logErrorToApi(errorType: string, error: any, extra?: Record<string, any>) {
  try {
    fetch('/api/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: errorType,
        message: error.message || String(error),
        stack: error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        extra
      }),
      keepalive: true
    }).catch(e => {
      console.error('记录错误到API失败:', e);
    });
  } catch (e) {
    console.error('发送错误日志失败:', e);
  }
}

// 用于监控应用程序静态和动态加载的性能指标
export const monitorAppLoad = (appName: string) => {
  // 动态导入webVitals以避免嵌套的客户端导入
  import('./utils/webVitals').then(({ markPerformance, measurePerformance }) => {
    // 标记应用程序加载开始
    markPerformance(`${appName}_load`);
    
    // 在window加载完成后测量
    window.addEventListener('load', () => {
      setTimeout(() => {
        const duration = measurePerformance(`${appName}_load`, {
          reportTo: 'both'
        });
        
        if (!isProduction()) {
          console.log(`[应用加载] ${appName} 加载时间: ${duration.toFixed(2)}ms`);
        }
      }, 0);
    });
  });
};

// 导出默认初始化函数
export default initMonitoring; 