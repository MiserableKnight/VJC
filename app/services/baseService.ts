import { cache } from 'react';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  status?: 'success' | 'error';
  success: boolean;
}

export class BaseService {
  /**
   * 统一处理API请求
   * @param fetchFunction 获取数据的函数
   * @returns 统一格式的API响应
   */
  protected static async handleApiRequest<T>(
    fetchFunction: () => Promise<T>
  ): Promise<ApiResponse<T>> {
    try {
      const data = await fetchFunction();
      return {
        data,
        success: true,
        status: 'success'
      };
    } catch (error) {
      console.error('API请求错误:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        data: undefined,
        error: errorMessage,
        message: errorMessage,
        code: 'ERROR',
        success: false,
        status: 'error'
      };
    }
  }

  /**
   * 创建缓存的API请求
   * @param fetchFunction 获取数据的函数
   * @returns 缓存的API响应
   */
  protected static createCachedRequest<T, Args extends any[]>(
    fetchFunction: (...args: Args) => Promise<T>
  ) {
    return cache(async (...args: Args): Promise<ApiResponse<T>> => {
      return this.handleApiRequest(() => fetchFunction(...args));
    });
  }
} 