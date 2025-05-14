'use client';

import React, { lazy, Suspense, ComponentType } from 'react';

/**
 * 组件加载中的占位显示
 * 可以根据需要自定义加载动画
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4 min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * 懒加载组件的错误界面
 */
export const ErrorFallback = () => (
  <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50 text-center">
    <p>组件加载失败</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      刷新页面
    </button>
  </div>
);

/**
 * 组件懒加载高阶函数
 * @param importFunc 导入组件的函数
 * @param fallback 自定义加载中显示组件
 * @param errorComponent 自定义错误显示组件
 * @returns 懒加载的组件
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />,
  errorComponent: React.ReactNode = <ErrorFallback />
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorComponent}>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

/**
 * 简单的错误边界组件
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('组件加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * 使用示例:
 * 
 * const LazyChart = lazyLoad(() => import('../components/Chart'));
 * 
 * // 在组件中使用
 * return (
 *   <div>
 *     <LazyChart data={chartData} />
 *   </div>
 * );
 */ 