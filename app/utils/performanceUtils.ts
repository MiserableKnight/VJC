'use client';

// 添加LayoutShift接口，因为标准PerformanceEntry中没有hadRecentInput属性
interface LayoutShift extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

/**
 * 资源加载性能条目类型
 */
interface ResourcePerformanceEntry extends Omit<PerformanceResourceTiming, 'nextHopProtocol'> {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  nextHopProtocol?: string;
}

/**
 * 资源性能信息接口
 */
interface ResourcePerformanceInfo {
  url: string;
  duration: number;
  type: string;
  initiatorType: string;
}

/**
 * 慢资源信息接口
 */
interface SlowestResourceInfo {
  url: string;
  loadTime: number;
  type: string;
}

/**
 * 资源分析结果类型
 */
interface ResourceAnalysis {
  totalResources: number;
  totalLoadTime: number;
  avgLoadTime: number;
  slowestResource?: SlowestResourceInfo;
  resourcesByType: Record<string, { count: number; totalTime: number }>;
  error?: string;
}

/**
 * 计算页面首次内容绘制 (FCP) 指标
 * @returns Promise<number> FCP时间（毫秒）
 */
export function measureFCP(): Promise<number> {
  return new Promise(resolve => {
    // 如果已经支持Performance Observer API
    if ('PerformanceObserver' in window) {
      try {
        const po = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[0]; // 首次内容绘制
          po.disconnect();
          resolve(fcp.startTime);
        });
        
        // 观察首次内容绘制 (FCP)
        po.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.error('测量FCP时出错:', e);
        // 回退到使用load事件作为近似值
        resolve(performance.now());
      }
    } else {
      // 降级方案
      const loadTime = performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart :
        performance.now();
      resolve(loadTime);
    }
  });
}

/**
 * 计算累积布局偏移 (CLS) 指标
 * @returns Promise<number> CLS分数
 */
export function measureCLS(): Promise<number> {
  return new Promise(resolve => {
    let clsValue = 0;
    let clsEntries: LayoutShift[] = [];
    
    // 会话窗口的开始时间
    let sessionValue = 0;
    let sessionEntries: LayoutShift[] = [];
    let sessionId = Date.now();
    
    if ('PerformanceObserver' in window) {
      try {
        const po = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // 类型断言为LayoutShift
            const layoutShift = entry as LayoutShift;
            
            // 只考虑不涉及用户输入的布局偏移
            if (!layoutShift.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
              
              // 如果在一个会话窗口内
              if (
                firstSessionEntry &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000
              ) {
                sessionValue += layoutShift.value;
                sessionEntries.push(layoutShift);
              } else {
                sessionValue = layoutShift.value;
                sessionEntries = [layoutShift];
                sessionId = Date.now();
              }
              
              // 如果当前会话是最大的
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                clsEntries = sessionEntries;
              }
            }
          }
        });
        
        po.observe({ type: 'layout-shift', buffered: true });
        
        // 在页面卸载前报告最终CLS值
        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            po.takeRecords();
            po.disconnect();
            resolve(clsValue);
          }
        });
        
        // 页面卸载时也解析Promise
        window.addEventListener('pagehide', () => {
          po.takeRecords();
          po.disconnect();
          resolve(clsValue);
        });
        
        // 如果页面正常加载完成，5秒后解析
        setTimeout(() => resolve(clsValue), 5000);
      } catch (e) {
        console.error('测量CLS时出错:', e);
        resolve(0);
      }
    } else {
      resolve(0);
    }
  });
}

/**
 * 测量页面完全加载时间
 * @returns Promise<number> 页面加载时间（毫秒）
 */
export function measurePageLoadTime(): Promise<number> {
  return new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve(performance.now());
    } else {
      window.addEventListener('load', () => resolve(performance.now()), { once: true });
    }
  });
}

/**
 * 测量脚本执行时间
 * @param callback 要测量的回调函数
 * @returns [result, executionTime] 函数结果和执行时间
 */
export function measureExecutionTime<T>(callback: () => T): [T, number] {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  return [result, end - start];
}

/**
 * 定时检查查询选择器的元素是否可用
 * @param selector 要检查的CSS选择器
 * @param options 配置选项：间隔时间、超时时间和回调
 */
export function waitForElement(
  selector: string, 
  options: {
    interval?: number;
    timeout?: number;
    callback?: (element: Element) => void;
  } = {}
): Promise<Element> {
  const { interval = 50, timeout = 5000, callback } = options;
  
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    
    if (element) {
      if (callback) callback(element);
      return resolve(element);
    }
    
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const element = document.querySelector(selector);
      
      if (element) {
        clearInterval(intervalId);
        if (callback) callback(element);
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(intervalId);
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }
    }, interval);
  });
}

/**
 * 获取当前浏览器信息
 * @returns 浏览器信息对象
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  const browserInfo = {
    name: 'unknown',
    version: 'unknown',
    os: 'unknown',
    device: 'desktop'
  };
  
  // 检测浏览器
  if (ua.indexOf('Chrome') !== -1) {
    browserInfo.name = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    if (match) browserInfo.version = match[1];
  } else if (ua.indexOf('Firefox') !== -1) {
    browserInfo.name = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserInfo.version = match[1];
  } else if (ua.indexOf('Safari') !== -1) {
    browserInfo.name = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/);
    if (match) browserInfo.version = match[1];
  } else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg/') !== -1) {
    browserInfo.name = 'Edge';
    const match = ua.match(/Edge\/(\d+\.\d+)/) || ua.match(/Edg\/(\d+\.\d+)/);
    if (match) browserInfo.version = match[1];
  } else if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
    browserInfo.name = 'Internet Explorer';
    const match = ua.match(/MSIE (\d+\.\d+)/) || ua.match(/rv:(\d+\.\d+)/);
    if (match) browserInfo.version = match[1];
  }
  
  // 检测操作系统
  if (ua.indexOf('Windows') !== -1) {
    browserInfo.os = 'Windows';
  } else if (ua.indexOf('Mac') !== -1) {
    browserInfo.os = 'Mac';
  } else if (ua.indexOf('Linux') !== -1) {
    browserInfo.os = 'Linux';
  } else if (ua.indexOf('Android') !== -1) {
    browserInfo.os = 'Android';
    browserInfo.device = 'mobile';
  } else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
    browserInfo.os = 'iOS';
    browserInfo.device = ua.indexOf('iPad') !== -1 ? 'tablet' : 'mobile';
  }
  
  return browserInfo;
}

/**
 * 分析资源加载性能
 * @returns 资源加载性能分析结果
 */
export function analyzeResourcePerformance(): ResourceAnalysis {
  if (!window.performance || !window.performance.getEntriesByType) {
    return { 
      totalResources: 0, 
      totalLoadTime: 0, 
      avgLoadTime: 0, 
      resourcesByType: {},
      error: '当前浏览器不支持Performance API' 
    };
  }
  
  // 获取资源性能条目并转换为简单对象
  const resourceEntries = window.performance.getEntriesByType('resource');
  const resources: ResourcePerformanceInfo[] = [];
  
  // 安全地将性能条目转换为我们自己定义的类型
  for (let i = 0; i < resourceEntries.length; i++) {
    const entry = resourceEntries[i];
    resources.push({
      url: entry.name,
      duration: entry.duration,
      type: getResourceType(entry.name),
      initiatorType: 'initiatorType' in entry ? (entry as any).initiatorType : 'unknown'
    });
  }
  
  // 如果没有资源，返回空结果
  if (resources.length === 0) {
    return {
      totalResources: 0,
      totalLoadTime: 0,
      avgLoadTime: 0,
      resourcesByType: {}
    };
  }
  
  // 按资源类型分类
  const resourcesByType: Record<string, { count: number; totalTime: number }> = {};
  let totalLoadTime = 0;
  let slowestResource: ResourcePerformanceInfo | undefined;
  let maxLoadTime = 0;
  
  // 处理每个资源
  resources.forEach(resource => {
    // 更新资源类型统计
    const type = resource.type;
    if (!resourcesByType[type]) {
      resourcesByType[type] = { count: 0, totalTime: 0 };
    }
    resourcesByType[type].count++;
    resourcesByType[type].totalTime += resource.duration;
    
    // 更新总加载时间
    totalLoadTime += resource.duration;
    
    // 检查是否是最慢的资源
    if (resource.duration > maxLoadTime) {
      maxLoadTime = resource.duration;
      slowestResource = resource;
    }
  });
  
  // 计算平均加载时间
  const avgLoadTime = totalLoadTime / resources.length;
  
  // 构建最终结果
  return {
    totalResources: resources.length,
    totalLoadTime,
    avgLoadTime,
    resourcesByType,
    slowestResource: slowestResource ? {
      url: slowestResource.url,
      type: slowestResource.type,
      loadTime: slowestResource.duration
    } : undefined
  };
}

/**
 * 根据URL确定资源类型
 * @param url 资源URL
 * @returns 资源类型
 */
function getResourceType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  if (/jpe?g|png|gif|svg|webp|ico|bmp/i.test(extension)) {
    return 'image';
  } else if (/js/i.test(extension)) {
    return 'javascript';
  } else if (/css/i.test(extension)) {
    return 'css';
  } else if (/woff2?|ttf|otf|eot/i.test(extension)) {
    return 'font';
  } else if (/mp4|webm|ogg/i.test(extension)) {
    return 'video';
  } else if (/mp3|wav|aac/i.test(extension)) {
    return 'audio';
  } else if (/json/i.test(extension)) {
    return 'json';
  } else if (/xml/i.test(extension)) {
    return 'xml';
  } else if (/html?/i.test(extension)) {
    return 'html';
  } else {
    return 'other';
  }
} 