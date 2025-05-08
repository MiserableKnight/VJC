'use client';

import React, { FC, ReactNode, useState, useEffect, Suspense, memo, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useChartPerformance } from '../../hooks/useChartPerformance';

interface LazyChartProps {
  children: ReactNode;
  height?: string;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  id?: string;
}

// 默认图表骨架屏组件
const ChartSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p className="mt-2 text-sm text-gray-600">图表加载中...</p>
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
const LazyChartComponent: FC<LazyChartProps> = ({
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
  
  // 使用ref跟踪性能监控状态
  const perfStarted = useRef(false);
  const perfEnded = useRef(false);

  // 使用性能监控钩子
  const { startRender, endRender } = useChartPerformance(id, [], 1);
  
  // 当组件进入视口时启动渲染
  useEffect(() => {
    if (isVisible && !shouldRender) {
      // 开始性能监控
      if (!perfStarted.current) {
        perfStarted.current = true;
        startRender();
      }
      
      // 立即开始渲染组件
      setShouldRender(true);
    }
  }, [isVisible, shouldRender, startRender]);
  
  // 当组件开始渲染后，稍后标记为已加载
  useEffect(() => {
    if (shouldRender && !isLoaded) {
      const loadingTimeout = setTimeout(() => {
        setIsLoaded(true);
        
        // 记录渲染完成
        if (!perfEnded.current) {
          perfEnded.current = true;
          endRender();
        }
      }, 300);
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [shouldRender, isLoaded, endRender]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      perfStarted.current = false;
      perfEnded.current = false;
    };
  }, []);

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

// 使用memo包装组件，避免不必要的重新渲染
export const LazyChart = memo(LazyChartComponent); 