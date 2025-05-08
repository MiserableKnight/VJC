'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state，下次渲染时显示备用 UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    logError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 默认的错误 UI
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">渲染出错</h2>
          <p className="mb-4 text-red-500">{this.state.error?.message || '发生未知错误'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 