'use client';

import { FC, ReactNode, useState, useEffect, Suspense, lazy } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useChartPerformance } from '../../hooks/useChartPerformance';

interface LazyChartProps {
  children: ReactNode;
  height?: string;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  id?: string; // 添加ID用于性能监控
}

// 骨架屏组件
const ChartSkeleton: FC<{className?: string}> = ({className = ''}) => (
  <div className={`flex items-center justify-center h-full w-full bg-gray-100 animate-pulse rounded-lg ${className}`}>
    <div className="flex flex-col items-center space-y-2 w-full p-4">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-40 bg-gray-200 rounded w-full"></div>
      <div className="flex justify-between w-full mt-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

/**
 * 增强版懒加载图表组件
 * - 在图表进入视口时才渲染图表内容，节省资源
 * - 支持React.Suspense
 * - 包含骨架屏
 * - 支持性能监控
 */
export const LazyChart: FC<LazyChartProps> = ({
  children,
  height = 'h-[450px]',
  placeholder,
  threshold = 0.1,
  rootMargin = '200px 0px', // 增加预加载距离
  className = '',
  id = 'unknown-chart'
}) => {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>(
    { threshold, rootMargin },
    false
  );
  
  // 用于处理动画效果
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 使用性能监控钩子
  const metricsRef = useChartPerformance({
    id,
    trackLongTasks: true,
    trackFPS: shouldRender, // 只在渲染时跟踪FPS
    trackMemory: shouldRender && isLoaded, // 只在加载完成后跟踪内存
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  });
  
  useEffect(() => {
    // 当组件可见时，稍微延迟渲染，优化用户体验
    if (isVisible && !shouldRender) {
      // 使用requestIdleCallback在浏览器空闲时初始化图表
      if ('requestIdleCallback' in window) {
        const idleCallbackId = requestIdleCallback(() => {
          setShouldRender(true);
        }, { timeout: 200 });
        
        return () => cancelIdleCallback(idleCallbackId);
      } else {
        // 降级方案
        const timeoutId = setTimeout(() => {
          setShouldRender(true);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isVisible, shouldRender]);
  
  // 当shouldRender变为true时，设置一个延迟来模拟内容加载完成
  useEffect(() => {
    if (shouldRender && !isLoaded) {
      const loadingTimeout = setTimeout(() => {
        setIsLoaded(true);
      }, 300); // 给300ms让图表渲染
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [shouldRender, isLoaded]);
  
  // 自定义骨架屏，如果没有提供则使用默认骨架屏
  const skeletonContent = placeholder || <ChartSkeleton />;
  
  // 图表加载时的css类
  const contentClass = isLoaded 
    ? 'opacity-100 transition-opacity duration-500'
    : 'opacity-0';
  
  return (
    <div 
      ref={ref} 
      className={`${height} relative ${className}`}
      data-chart-id={id}
    >
      {/* 占位内容 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          {skeletonContent}
        </div>
      )}
      
      {/* 实际图表内容 */}
      {shouldRender && (
        <Suspense fallback={skeletonContent}>
          <div className={contentClass}>
            {children}
          </div>
        </Suspense>
      )}
    </div>
  );
}; 