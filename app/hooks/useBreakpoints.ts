'use client';

import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

// 断点系统设置
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type BreakpointKey = keyof typeof breakpoints;

/**
 * 创建针对特定断点的媒体查询字符串
 */
export const createBreakpointQuery = {
  up: (breakpoint: BreakpointKey) => 
    `(min-width: ${breakpoints[breakpoint]}px)`,
  
  down: (breakpoint: BreakpointKey) => 
    `(max-width: ${breakpoints[breakpoint] - 0.1}px)`,
  
  between: (start: BreakpointKey, end: BreakpointKey) => 
    `(min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.1}px)`,
  
  only: (breakpoint: BreakpointKey) => {
    const keys = Object.keys(breakpoints) as BreakpointKey[];
    const index = keys.indexOf(breakpoint);
    const nextBreakpoint = keys[index + 1];
    
    return nextBreakpoint
      ? createBreakpointQuery.between(breakpoint, nextBreakpoint)
      : createBreakpointQuery.up(breakpoint);
  }
};

// 类型定义：响应式值配置对象
export type ResponsiveValue<T> = Partial<Record<BreakpointKey, T>> & {
  base: T; // 基础值（默认）
};

/**
 * 统一的断点系统钩子
 * 使用方式：const bp = useBreakpoints();
 * 
 * 示例: 
 * if (bp.md) { ... } // md断点及以上
 * if (bp.between.sm.lg) { ... } // sm到lg之间
 */
export function useBreakpoints() {
  // 针对每个断点创建查询
  const xs = useMediaQuery(createBreakpointQuery.up('xs'));
  const sm = useMediaQuery(createBreakpointQuery.up('sm'));
  const md = useMediaQuery(createBreakpointQuery.up('md'));
  const lg = useMediaQuery(createBreakpointQuery.up('lg'));
  const xl = useMediaQuery(createBreakpointQuery.up('xl'));
  const xxl = useMediaQuery(createBreakpointQuery.up('2xl'));

  // 针对每个断点创建"向下"查询
  const xsDown = useMediaQuery(createBreakpointQuery.down('xs'));
  const smDown = useMediaQuery(createBreakpointQuery.down('sm'));
  const mdDown = useMediaQuery(createBreakpointQuery.down('md'));
  const lgDown = useMediaQuery(createBreakpointQuery.down('lg'));
  const xlDown = useMediaQuery(createBreakpointQuery.down('xl'));
  const xxlDown = useMediaQuery(createBreakpointQuery.down('2xl'));

  // 只匹配特定断点的查询
  const xsOnly = useMediaQuery(createBreakpointQuery.only('xs'));
  const smOnly = useMediaQuery(createBreakpointQuery.only('sm'));
  const mdOnly = useMediaQuery(createBreakpointQuery.only('md'));
  const lgOnly = useMediaQuery(createBreakpointQuery.only('lg'));
  const xlOnly = useMediaQuery(createBreakpointQuery.only('xl'));
  const xxlOnly = useMediaQuery(createBreakpointQuery.only('2xl'));

  // 区间查询（组合成嵌套对象便于使用）
  const between = useMemo(() => {
    const keys = Object.keys(breakpoints) as BreakpointKey[];
    const result: Record<string, Record<string, boolean>> = {};
    
    // 为每个起始断点创建嵌套对象
    keys.forEach((start) => {
      result[start] = {};
      
      // 为每个结束断点创建布尔值
      keys.forEach((end) => {
        if (breakpoints[start] < breakpoints[end]) {
          result[start][end] = useMediaQuery(
            createBreakpointQuery.between(start, end)
          );
        }
      });
    });
    
    return result;
  }, []);

  // 当前断点（从大到小检查）
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

  /**
   * 根据当前断点获取响应式值
   */
  function getResponsiveValue<T>(values: ResponsiveValue<T>): T {
    // 断点优先级从大到小
    const breakpointOrder: BreakpointKey[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    
    // 从当前断点开始，到最小断点结束
    for (const bp of breakpointOrder) {
      if ((xxl && bp === '2xl') ||
          (xl && bp === 'xl') ||
          (lg && bp === 'lg') ||
          (md && bp === 'md') ||
          (sm && bp === 'sm') ||
          (xs && bp === 'xs')) {
        if (values[bp] !== undefined) {
          return values[bp] as T;
        }
      }
    }
    
    // 如果没有找到匹配的断点值，返回基础值
    return values.base;
  }

  return {
    // 断点及以上
    xs, sm, md, lg, xl, xxl,
    
    // 断点及以下
    xsDown, smDown, mdDown, lgDown, xlDown, xxlDown,
    
    // 仅特定断点
    xsOnly, smOnly, mdOnly, lgOnly, xlOnly, xxlOnly,
    
    // 区间查询
    between,
    
    // 当前断点
    current,
    
    // 响应式值选择器
    value: getResponsiveValue,
    
    // 断点检查便捷函数
    is: {
      mobile: smDown,
      tablet: between.sm.lg,
      desktop: lg,
      largeDesktop: xl
    }
  };
} 