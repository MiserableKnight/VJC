// 添加服务器组件标记
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { logger, LogCategory } from '../utils/serverLogger';

/**
 * 日志中间件配置
 */
export interface LoggerMiddlewareConfig {
  excludePaths?: string[];  // 排除的路径
  hideSensitiveData?: boolean;  // 是否隐藏敏感数据
  logBody?: boolean;  // 是否记录请求体
  logHeaders?: boolean;  // 是否记录请求头
  sensitiveHeaders?: string[];  // 敏感头字段
  sensitiveParams?: string[];  // 敏感参数
}

/**
 * 默认中间件配置
 */
const DEFAULT_CONFIG: LoggerMiddlewareConfig = {
  excludePaths: ['/api/health', '/api/logs'],
  hideSensitiveData: true,
  logBody: true,
  logHeaders: false,
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'set-cookie',
    'x-auth-token',
    'x-csrf-token'
  ],
  sensitiveParams: [
    'password',
    'token',
    'secret',
    'auth',
    'key',
    'apikey',
    'api_key',
    'access_token',
    'refresh_token'
  ]
};

/**
 * 创建日志中间件函数
 * @param config 中间件配置
 * @returns 中间件函数
 */
export function createLoggerMiddleware(config?: Partial<LoggerMiddlewareConfig>) {
  // 合并配置
  const mergedConfig: LoggerMiddlewareConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    sensitiveHeaders: [
      ...(DEFAULT_CONFIG.sensitiveHeaders || []),
      ...(config?.sensitiveHeaders || [])
    ],
    sensitiveParams: [
      ...(DEFAULT_CONFIG.sensitiveParams || []),
      ...(config?.sensitiveParams || [])
    ]
  };
  
  /**
   * 处理敏感数据
   * @param obj 源对象
   * @param sensitiveKeys 敏感键名
   * @returns 处理后的对象
   */
  const sanitizeObject = (
    obj: Record<string, any> | null | undefined,
    sensitiveKeys: string[]
  ): Record<string, any> | undefined => {
    if (!obj) return undefined;
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // 检查是否是敏感键
      const isMatched = sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive.toLowerCase())
      );
      
      if (isMatched) {
        // 敏感数据替换为占位符
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理嵌套对象
        result[key] = sanitizeObject(value, sensitiveKeys);
      } else {
        // 保持原值
        result[key] = value;
      }
    }
    
    return result;
  };
  
  /**
   * 解析URL中的查询参数
   * @param url URL对象
   * @returns 解析后的查询参数对象
   */
  const parseQueryParams = (url: URL): Record<string, string> => {
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };
  
  /**
   * 处理请求头
   * @param headers 请求头对象
   * @returns 处理后的请求头对象
   */
  const processHeaders = (
    headers: Headers
  ): Record<string, string> | undefined => {
    if (!mergedConfig.logHeaders) return undefined;
    
    const headersObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    if (mergedConfig.hideSensitiveData) {
      return sanitizeObject(headersObj, mergedConfig.sensitiveHeaders || []);
    }
    
    return headersObj;
  };
  
  /**
   * 处理请求体
   * @param request 请求对象
   * @returns 处理后的请求体
   */
  const processBody = async (
    request: NextRequest
  ): Promise<any | undefined> => {
    if (!mergedConfig.logBody) return undefined;
    
    // 只处理特定内容类型的请求体
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        // 克隆请求以避免消耗原始请求体
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        
        if (mergedConfig.hideSensitiveData) {
          return sanitizeObject(body, mergedConfig.sensitiveParams || []);
        }
        
        return body;
      } catch (e) {
        return { error: 'Unable to parse JSON body' };
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const clonedRequest = request.clone();
        const formData = await clonedRequest.formData();
        const body: Record<string, any> = {};
        
        formData.forEach((value, key) => {
          body[key] = value;
        });
        
        if (mergedConfig.hideSensitiveData) {
          return sanitizeObject(body, mergedConfig.sensitiveParams || []);
        }
        
        return body;
      } catch (e) {
        return { error: 'Unable to parse form data' };
      }
    }
    
    // 其他内容类型不处理
    return undefined;
  };
  
  /**
   * 日志中间件函数
   * @param request 请求对象
   * @param next 下一个中间件函数
   * @returns 响应对象
   */
  return async function loggerMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const start = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // 检查是否排除此路径
    if (mergedConfig.excludePaths?.some(p => path.startsWith(p))) {
      return next();
    }
    
    try {
      // 处理查询参数
      const query = parseQueryParams(url);
      const sanitizedQuery = mergedConfig.hideSensitiveData
        ? sanitizeObject(query, mergedConfig.sensitiveParams || [])
        : query;
      
      // 处理请求头
      const headers = processHeaders(request.headers);
      
      // 处理请求体 (异步)
      const body = await processBody(request);
      
      // 记录请求
      logger.logApiRequest({
        method,
        path,
        query: sanitizedQuery,
        headers,
        body,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      // 继续处理请求
      const response = await next();
      const duration = Date.now() - start;
      
      // 记录响应
      logger.logApiResponse({
        statusCode: response.status,
        path,
        method,
        duration
      });
      
      return response;
    } catch (error) {
      // 记录错误
      const duration = Date.now() - start;
      
      logger.error(
        `API错误: ${method} ${path}`,
        LogCategory.API,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          duration,
          method,
          path
        }
      );
      
      // 继续抛出错误，让错误处理中间件处理
      throw error;
    }
  };
}

// 导出默认中间件
export default createLoggerMiddleware(); 