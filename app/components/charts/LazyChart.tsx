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
  // 使用ref存储可见性和渲染状态，避免频繁重渲染
  const stateRef = useRef({
    isVisible: false,
    shouldRender: false,
    isLoaded: false,
    perfStarted: false,
    perfEnded: false
  });
  
  // 仅使用useState存储UI需要更新的状态
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 观察元素可见性
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>(
    { threshold, rootMargin },
    false
  );
  
  // 性能监控
  const { startRender, endRender } = useChartPerformance(id, [], 1);
  
  // 当可见性变化时，更新渲染状态
  useEffect(() => {
    if (isVisible && !stateRef.current.shouldRender) {
      // 记录当前可见
      stateRef.current.isVisible = true;
      stateRef.current.shouldRender = true;
      
      // 开始性能监控 (仅首次)
      if (!stateRef.current.perfStarted) {
        stateRef.current.perfStarted = true;
        startRender();
      }
      
      // 在渲染后安排加载状态更新
      const loadTimeout = setTimeout(() => {
        // 只有当组件仍然挂载并且尚未加载时更新状态
        if (!stateRef.current.isLoaded) {
          stateRef.current.isLoaded = true;
          setIsLoaded(true);
          
          // 结束性能监控 (仅首次)
          if (!stateRef.current.perfEnded) {
            stateRef.current.perfEnded = true;
            endRender();
          }
        }
      }, 300);
      
      return () => clearTimeout(loadTimeout);
    }
  }, [isVisible, startRender, endRender]);
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stateRef.current = {
        isVisible: false,
        shouldRender: false,
        isLoaded: false,
        perfStarted: false,
        perfEnded: false
      };
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
      {stateRef.current.shouldRender && (
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