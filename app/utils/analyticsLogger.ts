import { isProduction } from '../config/env';

// 用户行为事件类型
export enum EventType {
  PAGE_VIEW = 'PAGE_VIEW',
  CLICK = 'CLICK',
  SEARCH = 'SEARCH',
  FILTER = 'FILTER',
  SORT = 'SORT',
  CHART_INTERACTION = 'CHART_INTERACTION',
  DOWNLOAD = 'DOWNLOAD',
  FORM_SUBMIT = 'FORM_SUBMIT',
  FEATURE_USAGE = 'FEATURE_USAGE',
  ERROR = 'ERROR',
  CUSTOM = 'CUSTOM'
}

// 用户行为事件严重程度
export enum EventCategory {
  NAVIGATION = 'NAVIGATION',
  UI_INTERACTION = 'UI_INTERACTION',
  DATA_INTERACTION = 'DATA_INTERACTION',
  SYSTEM = 'SYSTEM',
  CONVERSION = 'CONVERSION'
}

// 用户行为日志接口
interface UserEvent {
  eventType: EventType;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  url?: string;
  referrer?: string;
  extra?: Record<string, any>;
}

// 会话ID存储
let currentSessionId: string | null = null;

/**
 * 初始化分析系统
 */
export function initAnalytics(): void {
  // 生成会话ID
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  
  // 记录页面浏览事件
  logEvent({
    eventType: EventType.PAGE_VIEW,
    category: EventCategory.NAVIGATION,
    action: 'page_load',
    label: document.title,
    url: window.location.href,
    referrer: document.referrer
  });
  
  // 添加路由变化监听器 (适用于Next.js)
  if (typeof window !== 'undefined') {
    try {
      const handleRouteChange = (url: string) => {
        logEvent({
          eventType: EventType.PAGE_VIEW,
          category: EventCategory.NAVIGATION,
          action: 'route_change',
          label: document.title,
          url: url,
          referrer: window.location.href
        });
      };
      
      // 为 Next.js 添加路由事件监听器
      // 注意：需要在实际应用中根据使用的路由库进行调整
      // 这里是Next.js Router的用法示例
      import('next/router').then(({ Router }) => {
        Router.events.on('routeChangeComplete', handleRouteChange);
      }).catch(error => {
        console.error('无法导入Next路由器:', error);
      });
    } catch (e) {
      console.error('设置路由监听器失败:', e);
    }
  }
}

/**
 * 记录用户事件
 */
export function logEvent(eventData: Partial<UserEvent>): void {
  try {
    const event: UserEvent = {
      eventType: eventData.eventType || EventType.CUSTOM,
      category: eventData.category || EventCategory.UI_INTERACTION,
      action: eventData.action || 'unknown_action',
      label: eventData.label,
      value: eventData.value,
      timestamp: Date.now(),
      sessionId: currentSessionId || generateSessionId(),
      userId: getUserId(),
      url: eventData.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      referrer: eventData.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      extra: eventData.extra
    };

    // 开发环境在控制台打印
    if (!isProduction()) {
      console.log(`[Analytics] ${event.eventType} - ${event.action}`);
    }

    // 在生产环境中将事件发送到服务器
    if (isProduction()) {
      sendToServer(event);
    }
  } catch (error) {
    console.error('记录分析事件失败:', error);
  }
}

/**
 * 记录点击事件
 */
export function logClick(elementId: string, elementName: string, extra?: Record<string, any>): void {
  logEvent({
    eventType: EventType.CLICK,
    category: EventCategory.UI_INTERACTION,
    action: 'click',
    label: elementName,
    extra: {
      elementId,
      ...extra
    }
  });
}

/**
 * 记录搜索事件
 */
export function logSearch(searchTerm: string, resultsCount?: number): void {
  logEvent({
    eventType: EventType.SEARCH,
    category: EventCategory.DATA_INTERACTION,
    action: 'search',
    label: searchTerm,
    value: resultsCount,
    extra: {
      searchTerm,
      resultsCount
    }
  });
}

/**
 * 记录过滤操作
 */
export function logFilter(filterName: string, filterValue: any): void {
  logEvent({
    eventType: EventType.FILTER,
    category: EventCategory.DATA_INTERACTION,
    action: 'filter',
    label: filterName,
    extra: {
      filterName,
      filterValue: JSON.stringify(filterValue)
    }
  });
}

/**
 * 记录排序操作
 */
export function logSort(columnName: string, direction: 'asc' | 'desc'): void {
  logEvent({
    eventType: EventType.SORT,
    category: EventCategory.DATA_INTERACTION,
    action: 'sort',
    label: columnName,
    extra: {
      columnName,
      direction
    }
  });
}

/**
 * 记录图表交互
 */
export function logChartInteraction(chartId: string, interactionType: string, extra?: Record<string, any>): void {
  logEvent({
    eventType: EventType.CHART_INTERACTION,
    category: EventCategory.DATA_INTERACTION,
    action: 'chart_interaction',
    label: `${chartId}_${interactionType}`,
    extra: {
      chartId,
      interactionType,
      ...extra
    }
  });
}

/**
 * 记录下载操作
 */
export function logDownload(fileType: string, fileName: string, fileSize?: number): void {
  logEvent({
    eventType: EventType.DOWNLOAD,
    category: EventCategory.CONVERSION,
    action: 'download',
    label: fileName,
    value: fileSize,
    extra: {
      fileType,
      fileName,
      fileSize
    }
  });
}

/**
 * 记录表单提交
 */
export function logFormSubmit(formId: string, formName: string, successful: boolean): void {
  logEvent({
    eventType: EventType.FORM_SUBMIT,
    category: EventCategory.CONVERSION,
    action: successful ? 'form_submit_success' : 'form_submit_failure',
    label: formName,
    extra: {
      formId,
      formName,
      successful
    }
  });
}

/**
 * 记录功能使用
 */
export function logFeatureUsage(featureName: string, details?: Record<string, any>): void {
  logEvent({
    eventType: EventType.FEATURE_USAGE,
    category: EventCategory.SYSTEM,
    action: 'feature_usage',
    label: featureName,
    extra: {
      featureName,
      ...details
    }
  });
}

/**
 * 发送分析数据到服务器
 */
function sendToServer(event: UserEvent): void {
  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      // 分析日志不应该阻塞UI
      keepalive: true
    }).catch(e => {
      console.error('发送分析事件失败:', e);
    });
  } catch (e) {
    console.error('分析事件处理失败:', e);
  }
}

/**
 * 生成唯一会话ID
 */
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 获取用户ID (从localStorage或cookie)
 */
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  try {
    // 尝试从localStorage获取
    let userId = localStorage.getItem('user_id');
    
    // 如果不存在，生成一个
    if (!userId) {
      userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem('user_id', userId);
    }
    
    return userId;
  } catch (e) {
    console.error('获取用户ID失败:', e);
    return undefined;
  }
}

/**
 * 添加通用点击事件跟踪
 * 可以在应用初始化时调用此函数，为带有data-track属性的元素自动添加跟踪
 */
export function setupClickTracking(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // 使用委托处理点击事件
    document.body.addEventListener('click', (event) => {
      // 查找被点击的元素或其父元素上的data-track属性
      let target = event.target as HTMLElement;
      let trackElement = null;
      
      // 向上查找5层，寻找带有data-track属性的元素
      for (let i = 0; i < 5 && target && !trackElement; i++) {
        if (target.hasAttribute('data-track')) {
          trackElement = target;
        } else {
          target = target.parentElement as HTMLElement;
        }
      }
      
      if (trackElement) {
        const trackData = trackElement.getAttribute('data-track');
        const trackId = trackElement.getAttribute('data-track-id') || '';
        const trackExtra = trackElement.getAttribute('data-track-extra');
        
        let extraData = {};
        try {
          if (trackExtra) {
            extraData = JSON.parse(trackExtra);
          }
        } catch (e) {
          console.error('解析跟踪额外数据失败:', e);
        }
        
        logClick(trackId, trackData || 'unknown', extraData);
      }
    });
  } catch (e) {
    console.error('设置点击跟踪失败:', e);
  }
} 