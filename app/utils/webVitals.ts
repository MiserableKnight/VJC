'use client';

import { 
  onCLS, 
  onFCP, 
  onLCP, 
  onTTFB,
  type Metric
} from 'web-vitals';
import { isProduction } from '../config/env';

/**
 * Web Vitals指标类型
 */
export type WebVitalsMetrics = {
  id: string;  // 唯一标识符
  name: string;  // 指标名称
  value: number;  // 指标值
  rating: 'good' | 'needs-improvement' | 'poor';  // 评级
  delta: number;  // 增量变化
  navigationType?: string;  // 导航类型
};

/**
 * Web Vitals指标上报选项
 */
export type WebVitalsReportOptions = {
  reportTo?: 'console' | 'api' | 'both';  // 上报目标
  debug?: boolean;  // 调试模式
  path?: string;  // 当前页面路径
  analyticsId?: string;  // 分析ID
};

/**
 * 评估指标性能
 * @param value 指标值
 * @param name 指标名
 * @returns 性能评级
 */
const getRating = (value: number, name: string): 'good' | 'needs-improvement' | 'poor' => {
  if (name === 'CLS') {
    // 布局偏移评级
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  
  if (name === 'FID') {
    // 首次输入延迟评级
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }
  
  if (name === 'LCP') {
    // 最大内容绘制评级
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }
  
  if (name === 'FCP') {
    // 首次内容绘制评级
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }
  
  if (name === 'TTFB') {
    // 首字节时间评级
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }
  
  return 'needs-improvement';
};

/**
 * 处理Web Vitals指标
 * @param metric Web Vitals指标
 * @param options 上报选项
 */
const handleWebVitals = (
  metric: Metric, 
  options: WebVitalsReportOptions = {}
): void => {
  const { reportTo = isProduction() ? 'console' : 'console', debug = !isProduction(), path } = options;
  
  // 创建指标数据
  const vitalsData: WebVitalsMetrics = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.value, metric.name),
    delta: metric.delta,
    navigationType: metric.navigationType
  };
  
  // 获取当前路径
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
  
  // 添加页面信息
  const metricWithContext = {
    ...vitalsData,
    path: currentPath,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now()
  };

  // 只记录到控制台，不再发送到API
  if (debug || true) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${vitalsData.rating})`);
    if (debug) {
      console.log(metricWithContext);
    }
  }
  
  // Vercel环境中文件系统是只读的，禁用API上报
  // if (reportTo === 'api' || reportTo === 'both') {
  //   try {
  //     // 将指标发送到API
  //     const body = JSON.stringify(metricWithContext);
  //     
  //     // 使用beacon API在页面卸载时也能发送数据
  //     if (navigator.sendBeacon) {
  //       navigator.sendBeacon('/api/vitals', body);
  //     } else {
  //       fetch('/api/vitals', {
  //         body,
  //         method: 'POST',
  //         keepalive: true,
  //         headers: { 'Content-Type': 'application/json' }
  //       }).catch(err => {
  //         console.error('[Web Vitals] 发送性能指标失败:', err);
  //       });
  //     }
  //   } catch (e) {
  //     console.error('[Web Vitals] 处理性能指标失败:', e);
  //   }
  // }
};

/**
 * 报告Web Vitals核心指标
 * @param options 上报选项
 */
export function reportWebVitals(options: WebVitalsReportOptions = {}): void {
  try {
    // 检查浏览器环境
    if (typeof window === 'undefined') return;
    
    // 报告累积布局偏移 (CLS)
    onCLS(metric => handleWebVitals(metric, options));
    
    // 注意：FID已在web-vitals v5中被移除，INP替代了它
    // 但INP需要单独安装，当前省略
    
    // 报告首次内容绘制 (FCP)
    onFCP(metric => handleWebVitals(metric, options));
    
    // 报告最大内容绘制 (LCP)
    onLCP(metric => handleWebVitals(metric, options));
    
    // 报告首字节时间 (TTFB)
    onTTFB(metric => handleWebVitals(metric, options));
    
  } catch (error) {
    console.error('[Web Vitals] 初始化性能监控失败:', error);
  }
}

/**
 * 增强的性能指标，包含Web Vitals和额外指标
 */
export interface EnhancedPerformanceMetrics {
  coreWebVitals: {
    cls?: number;  // 累积布局偏移
    fid?: number;  // 首次输入延迟
    lcp?: number;  // 最大内容绘制
    fcp?: number;  // 首次内容绘制
    ttfb?: number; // 首字节时间
  };
  resourceMetrics?: {
    totalResources: number;  // 资源总数
    totalSize: number;  // 资源总大小 (字节)
    slowestResource?: {
      url: string;
      duration: number;
      size: number;
    };
  };
  interactionMetrics?: {
    domInteractive: number;  // DOM可交互时间
    domComplete: number;    // DOM完成时间
    loadEventEnd: number;   // 加载事件结束时间
  };
  customMetrics?: Record<string, number>;  // 自定义指标
  deviceInfo: {
    userAgent: string;
    deviceMemory?: number;  // 设备内存 (GB)
    hardwareConcurrency?: number; // CPU核心数
    connectionType?: string; // 网络连接类型
    effectiveConnectionType?: string; // 有效连接类型
  };
}

/**
 * 收集增强的性能指标
 * @returns Promise<EnhancedPerformanceMetrics> 增强的性能指标
 */
export async function collectEnhancedMetrics(): Promise<EnhancedPerformanceMetrics> {
  // 创建返回对象
  const metrics: EnhancedPerformanceMetrics = {
    coreWebVitals: {},
    deviceInfo: {
      userAgent: navigator.userAgent
    }
  };
  
  // 尝试收集设备信息
  try {
    // 设备内存
    if ('deviceMemory' in navigator) {
      metrics.deviceInfo.deviceMemory = (navigator as any).deviceMemory;
    }
    
    // CPU核心数
    if ('hardwareConcurrency' in navigator) {
      metrics.deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency;
    }
    
    // 网络信息
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        metrics.deviceInfo.connectionType = conn.type;
        metrics.deviceInfo.effectiveConnectionType = conn.effectiveType;
      }
    }
  } catch (e) {
    console.error('[Web Vitals] 收集设备信息失败:', e);
  }
  
  // 收集性能指标
  try {
    // 如果支持Performance API
    if (window.performance) {
      if (window.performance.timing) {
        const timing = window.performance.timing;
        
        // 交互指标
        metrics.interactionMetrics = {
          domInteractive: timing.domInteractive - timing.navigationStart,
          domComplete: timing.domComplete - timing.navigationStart,
          loadEventEnd: timing.loadEventEnd - timing.navigationStart
        };
      }
      
      // 分析资源性能
      if (window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        if (resources.length) {
          let totalSize = 0;
          let slowestDuration = 0;
          let slowestResource = null;
          
          // 分析每个资源
          for (const resource of resources) {
            const size = resource.encodedBodySize || 0;
            totalSize += size;
            
            if (resource.duration > slowestDuration) {
              slowestDuration = resource.duration;
              slowestResource = {
                url: resource.name,
                duration: resource.duration,
                size: size
              };
            }
          }
          
          // 设置资源指标
          metrics.resourceMetrics = {
            totalResources: resources.length,
            totalSize: totalSize,
            slowestResource: slowestResource || undefined
          };
        }
      }
    }
  } catch (e) {
    console.error('[Web Vitals] 收集性能指标失败:', e);
  }
  
  return metrics;
}

/**
 * 在应用初始化时启动性能监控
 */
export function initPerformanceMonitoring(options: WebVitalsReportOptions = {}): void {
  // 报告Web Vitals指标
  reportWebVitals(options);
  
  // 页面加载完成后收集增强指标
  if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
      // 确保页面完全加载
      setTimeout(async () => {
        try {
          const enhancedMetrics = await collectEnhancedMetrics();
          
          if (options.reportTo === 'console' || options.reportTo === 'both' || options.debug) {
            console.log('[Performance] 增强性能指标:', enhancedMetrics);
          }
          
          if (options.reportTo === 'api' || options.reportTo === 'both') {
            // 发送到API
            fetch('/api/performance-metrics', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: `perf_${Date.now()}`,
                metrics: enhancedMetrics,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
              }),
              keepalive: true
            }).catch(e => {
              console.error('[Performance] 发送增强指标失败:', e);
            });
          }
        } catch (e) {
          console.error('[Performance] 处理增强指标失败:', e);
        }
      }, 1000); // 延迟1秒确保页面完全加载
    });
  }
}

/**
 * 标记自定义性能指标起点
 * @param markName 指标名称
 */
export function markPerformance(markName: string): void {
  if (typeof window === 'undefined' || !window.performance || !window.performance.mark) return;
  
  try {
    window.performance.mark(`${markName}_start`);
  } catch (e) {
    console.error(`[Performance] 标记性能指标 ${markName} 失败:`, e);
  }
}

/**
 * 标记自定义性能指标终点并计算持续时间
 * @param markName 指标名称
 * @param reportOptions 上报选项
 * @returns 指标持续时间（毫秒）
 */
export function measurePerformance(
  markName: string, 
  reportOptions?: WebVitalsReportOptions
): number {
  if (
    typeof window === 'undefined' || 
    !window.performance || 
    !window.performance.mark || 
    !window.performance.measure
  ) return 0;
  
  try {
    // 标记结束点
    window.performance.mark(`${markName}_end`);
    
    // 测量开始和结束之间的时间
    window.performance.measure(
      markName,
      `${markName}_start`,
      `${markName}_end`
    );
    
    // 获取测量结果
    const entries = window.performance.getEntriesByName(markName);
    const duration = entries.length > 0 ? entries[0].duration : 0;
    
    // 上报测量结果
    if (reportOptions) {
      const { reportTo = 'console' } = reportOptions;
      
      if (reportTo === 'console' || reportTo === 'both') {
        console.log(`[Performance] ${markName}: ${duration.toFixed(2)}ms`);
      }
      
      if (reportTo === 'api' || reportTo === 'both') {
        // 发送到API
        fetch('/api/performance-metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: `measure_${Date.now()}`,
            metrics: {
              customMetrics: {
                [markName]: duration
              }
            },
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }),
          keepalive: true
        }).catch(e => {
          console.error(`[Performance] 发送自定义指标 ${markName} 失败:`, e);
        });
      }
    }
    
    return duration;
  } catch (e) {
    console.error(`[Performance] 测量性能指标 ${markName} 失败:`, e);
    return 0;
  }
} 