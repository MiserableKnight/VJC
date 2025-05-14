'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

// 定义断点尺寸
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export type Breakpoint = keyof typeof breakpoints;

// 响应式值配置
export type ResponsiveValue<T> = {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  base: T; // 默认值
};

/**
 * 根据当前断点获取响应式值
 */
export function getResponsiveValue<T>(values: ResponsiveValue<T>, currentBreakpoint: Breakpoint | 'xs'): T {
  // 断点优先级从大到小
  const breakpointOrder: (Breakpoint | 'xs')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  // 找到当前断点在优先级列表中的索引
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // 从当前断点开始，到最小断点结束
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const breakpoint = breakpointOrder[i];
    // @ts-ignore - xs 不在 Breakpoint 类型中，但我们需要支持它
    if (values[breakpoint] !== undefined) {
      // @ts-ignore
      return values[breakpoint];
    }
  }
  
  // 如果没有找到匹配的断点值，返回基础值
  return values.base;
}

/**
 * 响应式Hook，提供常用的响应式断点判断
 * @returns 包含各断点匹配状态的对象
 */
export function useResponsive() {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isLargeDesktop = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

  // 特定断点及以上匹配
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const md = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const lg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const xl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${breakpoints['2xl']}px)`);

  // 特定断点及以下匹配
  const smDown = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const mdDown = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
  const lgDown = useMediaQuery(`(max-width: ${breakpoints.lg - 1}px)`);
  const xlDown = useMediaQuery(`(max-width: ${breakpoints.xl - 1}px)`);
  const xxlDown = useMediaQuery(`(max-width: ${breakpoints['2xl'] - 1}px)`);

  // 特定断点内匹配
  const smOnly = useMediaQuery(`(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`);
  const mdOnly = useMediaQuery(`(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`);
  const lgOnly = useMediaQuery(`(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`);
  const xlOnly = useMediaQuery(`(min-width: ${breakpoints.xl}px) and (max-width: ${breakpoints['2xl'] - 1}px)`);
  const xxlOnly = useMediaQuery(`(min-width: ${breakpoints['2xl']}px)`);

  // 获取窗口宽度
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 375
  );

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化宽度

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 计算当前断点
  const current = xxlOnly 
    ? '2xl' 
    : xlOnly 
      ? 'xl' 
      : lgOnly 
        ? 'lg' 
        : mdOnly 
          ? 'md' 
          : smOnly 
            ? 'sm' 
            : 'xs';

  // 响应式值选择器函数
  const value = <T>(values: ResponsiveValue<T>): T => {
    return getResponsiveValue(values, current);
  };

  return {
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // 断点及以上
    sm,
    md,
    lg,
    xl,
    xxl,
    
    // 断点及以下
    smDown,
    mdDown,
    lgDown,
    xlDown,
    xxlDown,
    
    // 仅特定断点
    smOnly,
    mdOnly,
    lgOnly,
    xlOnly,
    xxlOnly,
    
    // 当前断点名称
    current,
    
    // 响应式值选择器
    value,
    
    // 兼容原来的API
    width,
    breakpoint: current
  };
} 