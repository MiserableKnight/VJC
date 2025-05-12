import { ErrorInfo } from 'react';
import { isProduction } from '../config/env';

// 定义错误类型
export enum ErrorType {
  RENDER = 'RENDER',
  API = 'API',
  DATA = 'DATA',
  CHART = 'CHART',
  NETWORK = 'NETWORK',
  OTHER = 'OTHER'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 错误日志接口
interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string | null;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: number;
  userAgent?: string;
  url?: string;
  extra?: Record<string, any>;
}

/**
 * 记录React组件渲染错误
 */
export function logError(error: Error, errorInfo?: ErrorInfo): void {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack || null,
    type: ErrorType.RENDER,
    severity: ErrorSeverity.HIGH,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  };

  // 开发环境在控制台打印
  if (!isProduction()) {
    console.error('=== 组件错误 ===');
    console.error(errorLog);
    console.error(errorInfo?.componentStack || '无组件堆栈信息');
  }

  // 在生产环境中将错误发送到服务器
  if (isProduction()) {
    sendToServer(errorLog);
  }
}

/**
 * 记录API请求错误
 */
export function logApiError(error: any, endpoint: string, requestData?: any): void {
  const errorLog: ErrorLog = {
    message: error.message || '未知API错误',
    stack: error.stack,
    type: ErrorType.API,
    severity: ErrorSeverity.MEDIUM,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    extra: {
      endpoint,
      requestData,
      statusCode: error.status || error.statusCode,
      responseData: error.response ? error.response.data : undefined
    }
  };

  // 开发环境在控制台打印
  if (!isProduction()) {
    console.error('=== API错误 ===');
    console.error(errorLog);
  }

  // 在生产环境中将错误发送到服务器
  if (isProduction()) {
    sendToServer(errorLog);
  }
}

/**
 * 记录图表相关错误
 */
export function logChartError(error: any, chartType: string, data?: any): void {
  const errorLog: ErrorLog = {
    message: error.message || '图表渲染错误',
    stack: error.stack,
    type: ErrorType.CHART,
    severity: ErrorSeverity.MEDIUM,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    extra: {
      chartType,
      dataLength: data ? data.length : 0,
      dataPreview: data ? JSON.stringify(data.slice(0, 2)) : undefined
    }
  };

  // 开发环境在控制台打印
  if (!isProduction()) {
    console.error('=== 图表错误 ===');
    console.error(errorLog);
  }

  // 在生产环境中将错误发送到服务器
  if (isProduction()) {
    sendToServer(errorLog);
  }
}

/**
 * 记录数据处理错误
 */
export function logDataError(error: any, dataSource: string, data?: any): void {
  const errorLog: ErrorLog = {
    message: error.message || '数据处理错误',
    stack: error.stack,
    type: ErrorType.DATA,
    severity: ErrorSeverity.MEDIUM,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    extra: {
      dataSource,
      dataPreview: data ? JSON.stringify(data).substring(0, 500) : undefined
    }
  };

  // 开发环境在控制台打印
  if (!isProduction()) {
    console.error('=== 数据错误 ===');
    console.error(errorLog);
  }

  // 在生产环境中将错误发送到服务器
  if (isProduction()) {
    sendToServer(errorLog);
  }
}

/**
 * 发送错误日志到服务器
 * 可以使用各种日志服务，如Sentry, LogRocket等
 */
function sendToServer(errorLog: ErrorLog): void {
  // 在实际应用中，替换为实际的错误日志服务
  // 这里只是一个示例
  try {
    // 将错误发送到服务器端API
    fetch('/api/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorLog),
      // 错误日志本身不应该因为网络问题而阻塞UI
      keepalive: true
    }).catch(e => {
      // 静默失败，错误日志API本身的错误不应该进一步干扰用户体验
      console.error('发送错误日志失败:', e);
    });
  } catch (e) {
    // 捕获任何可能的错误，避免错误记录器本身导致问题
    console.error('错误日志处理失败:', e);
  }
} 