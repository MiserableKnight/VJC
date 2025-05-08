'use client';

import { useEffect, useRef } from 'react';

interface PerformanceOptions {
  id: string;
  trackLongTasks?: boolean;
  trackFPS?: boolean;
  trackMemory?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

interface PerformanceMetrics {
  renderTime?: number;
  longTasks?: Array<{duration: number, startTime: number}>;
  fps?: number;
  memoryUsage?: number;
}

/**
 * 自定义钩子用于监控图表渲染性能
 * 
 * @param options 性能监控配置选项
 * @returns 性能指标对象的引用
 */
export function useChartPerformance(options: PerformanceOptions) {
  const { 
    id, 
    trackLongTasks = true, 
    trackFPS = false, 
    trackMemory = false,
    logLevel = 'info' 
  } = options;
  
  const metricsRef = useRef<PerformanceMetrics>({});
  const observerRef = useRef<PerformanceObserver | null>(null);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  
  // 记录日志，根据日志级别决定使用哪个console方法
  const logMetric = (message: string, metric?: any, level: 'debug' | 'info' | 'warn' | 'error' = 'info') => {
    const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (logLevels[level] >= logLevels[logLevel]) {
      switch (level) {
        case 'debug':
          console.debug(`[Chart ${id}] ${message}`, metric);
          break;
        case 'warn':
          console.warn(`[Chart ${id}] ${message}`, metric);
          break;
        case 'error':
          console.error(`[Chart ${id}] ${message}`, metric);
          break;
        default:
          console.log(`[Chart ${id}] ${message}`, metric);
      }
    }
  };
  
  // 跟踪长任务
  useEffect(() => {
    if (!trackLongTasks || typeof window.PerformanceObserver === 'undefined') return;
    
    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const longTasksMetrics = entries.map(entry => ({
          duration: entry.duration,
          startTime: entry.startTime
        }));
        
        metricsRef.current.longTasks = [
          ...(metricsRef.current.longTasks || []),
          ...longTasksMetrics
        ];
        
        entries.forEach(entry => {
          logMetric('检测到长任务', { duration: `${entry.duration}ms` }, 'warn');
        });
      });
      
      observerRef.current.observe({ entryTypes: ['longtask'] });
      logMetric('已启用长任务监控', undefined, 'debug');
    } catch (e) {
      logMetric('无法启用长任务监控', e, 'error');
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [id, trackLongTasks, logLevel]);
  
  // 跟踪FPS
  useEffect(() => {
    if (!trackFPS) return;
    
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    lastFrameTimeRef.current = startTimeRef.current;
    
    const trackFrame = () => {
      const now = performance.now();
      frameCountRef.current++;
      
      // 每秒计算一次FPS
      if (now - lastFrameTimeRef.current >= 1000) {
        const elapsedSecs = (now - lastFrameTimeRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / elapsedSecs);
        metricsRef.current.fps = fps;
        
        if (fps < 30) {
          logMetric('FPS过低', { fps }, 'warn');
        } else {
          logMetric('当前FPS', { fps }, 'debug');
        }
        
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      
      frameIdRef.current = requestAnimationFrame(trackFrame);
    };
    
    const frameIdRef = { current: requestAnimationFrame(trackFrame) };
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [id, trackFPS, logLevel]);
  
  // 跟踪内存使用
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;
    
    const memoryCheckInterval = setInterval(() => {
      // @ts-ignore: memory属性在标准Performance接口中不存在，但在Chrome中可用
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const usedHeapSize = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
        metricsRef.current.memoryUsage = usedHeapSize;
        
        if (usedHeapSize > 100) { // 如果使用超过100MB，发出警告
          logMetric('内存使用量高', { usedHeapSize: `${usedHeapSize.toFixed(2)}MB` }, 'warn');
        } else {
          logMetric('当前内存使用', { usedHeapSize: `${usedHeapSize.toFixed(2)}MB` }, 'debug');
        }
      }
    }, 5000); // 每5秒检查一次
    
    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, [id, trackMemory, logLevel]);
  
  // 记录渲染时间
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTimeRef.current;
      metricsRef.current.renderTime = renderTime;
      
      if (renderTime > 500) {
        logMetric('渲染时间过长', { renderTime: `${renderTime.toFixed(2)}ms` }, 'warn');
      } else {
        logMetric('渲染完成', { renderTime: `${renderTime.toFixed(2)}ms` }, 'info');
      }
      
      // 记录所有指标的汇总
      logMetric('性能指标汇总', { 
        renderTime: `${renderTime.toFixed(2)}ms`,
        fps: metricsRef.current.fps,
        longTasks: metricsRef.current.longTasks?.length || 0,
        memoryUsage: metricsRef.current.memoryUsage ? 
          `${metricsRef.current.memoryUsage.toFixed(2)}MB` : 'N/A'
      });
    };
  }, [id, logLevel]);
  
  return metricsRef;
}

/**
 * 将性能数据发送到分析服务器
 * 
 * @param id 图表ID
 * @param metrics 性能指标
 */
export function reportPerformanceMetrics(id: string, metrics: PerformanceMetrics) {
  // 这里可以实现向分析服务器发送数据的逻辑
  // 例如使用fetch或beacon API发送数据
  if ('sendBeacon' in navigator) {
    const data = JSON.stringify({
      id,
      metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    navigator.sendBeacon('/api/performance-metrics', data);
  }
} 