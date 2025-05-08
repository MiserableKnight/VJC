'use client';

import { useState, useEffect, useMemo } from 'react';

// 定义响应式断点
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// 媒体查询别名
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
export function getResponsiveValue<T>(values: ResponsiveValue<T>, currentBreakpoint: Breakpoint): T {
  // 断点优先级从大到小
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  // 找到当前断点在优先级列表中的索引
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // 从当前断点开始，到最小断点结束
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint] as T;
    }
  }
  
  // 如果没有找到匹配的断点值，返回基础值
  return values.base;
}

/**
 * 响应式设计Hook
 * 提供当前断点和屏幕尺寸信息
 */
export function useResponsive() {
  // 获取初始窗口尺寸
  const getInitialSize = () => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    // 默认服务端尺寸
    return { width: 0, height: 0 };
  };
  
  const [size, setSize] = useState(getInitialSize);
  
  // 当前断点
  const currentBreakpoint = useMemo(() => {
    const width = size.width;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [size.width]);
  
  // 是否是移动设备 (小于md)
  const isMobile = useMemo(() => {
    return size.width < breakpoints.md;
  }, [size.width]);
  
  // 是否是平板设备 (大于等于md，小于lg)
  const isTablet = useMemo(() => {
    return size.width >= breakpoints.md && size.width < breakpoints.lg;
  }, [size.width]);
  
  // 是否是桌面设备 (大于等于lg)
  const isDesktop = useMemo(() => {
    return size.width >= breakpoints.lg;
  }, [size.width]);
  
  // 断点查询工具
  const isBreakpoint = useMemo(() => {
    return {
      xs: currentBreakpoint === 'xs',
      sm: currentBreakpoint === 'sm',
      md: currentBreakpoint === 'md',
      lg: currentBreakpoint === 'lg',
      xl: currentBreakpoint === 'xl',
      '2xl': currentBreakpoint === '2xl',
      smallerThan: (bp: Breakpoint) => size.width < breakpoints[bp],
      largerThan: (bp: Breakpoint) => size.width >= breakpoints[bp]
    };
  }, [currentBreakpoint, size.width]);
  
  // 快捷获取响应式值
  const value = <T>(values: ResponsiveValue<T>) => {
    return getResponsiveValue(values, currentBreakpoint);
  };
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    // 组件卸载时移除监听
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    width: size.width,
    height: size.height,
    breakpoint: currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    value
  };
} 