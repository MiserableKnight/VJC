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
    // 初始化性能监控 - 仅在控制台报告，不写入文件
    initPerformanceMonitoring({
      reportTo: 'console',  // 由于Vercel文件系统限制，只能记录到控制台
      debug: !isProduction()
    });
    
    // 初始化用户行为分析 - 不使用文件存储
    initAnalytics();
    
    // 设置自动点击跟踪
    setupClickTracking();
    
    // 注册全局错误处理程序，但禁用文件写入
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
    
    // 仅记录到控制台，不发送到API以避免文件系统错误
    console.error('[错误日志]', {
      type: 'unhandledrejection',
      message: error.message || String(error),
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  });
  
  // 处理全局错误
  window.addEventListener('error', (event) => {
    // 避免重复记录资源加载错误
    if (event.error) {
      console.error('[监控] 全局错误:', event.error);
      
      // 仅记录到控制台，不发送到API以避免文件系统错误
      console.error('[错误日志]', {
        type: 'global',
        message: event.error.message || String(event.error),
        stack: event.error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }
  });
}

/**
 * 将错误记录到API (已禁用文件写入)
 */
function logErrorToApi(errorType: string, error: any, extra?: Record<string, any>) {
  try {
    // 在Vercel部署中禁用API日志记录，避免文件系统错误
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      console.error('[错误日志]', {
        type: errorType,
        message: error.message || String(error),
        stack: error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        extra
      });
      return;
    }
    
    // 在开发环境或自托管环境中，可以继续使用API日志
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
          reportTo: 'console'  // 只记录到控制台
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