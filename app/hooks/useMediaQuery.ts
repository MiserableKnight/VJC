'use client';

import { useState, useEffect } from 'react';

/**
 * 自定义Hook用于响应式媒体查询
 * @param query 媒体查询字符串，例如 '(min-width: 768px)'
 * @returns 布尔值，表示查询是否匹配
 */
export function useMediaQuery(query: string): boolean {
  // 服务器端渲染时默认为false
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 确保代码在浏览器环境中运行
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // 设置初始值
      setMatches(media.matches);
      
      // 监听媒体查询变化
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // 添加监听器
      media.addEventListener('change', listener);
      
      // 清理函数
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]); // 当查询字符串变化时重新运行

  return matches;
} 