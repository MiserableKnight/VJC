'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题管理钩子
 * 支持亮色、暗色和系统主题
 */
export function useTheme() {
  // 使用localStorage存储用户的主题偏好
  const [themePreference, setThemePreference] = useLocalStorage<ThemeMode>(
    'theme-preference', 
    'system'
  );

  // 当前实际应用的主题
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

  // 检测系统主题首选项
  const detectSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  // 更新文档根元素的主题类
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setActiveTheme(theme);
  };

  // 切换主题
  const toggleTheme = () => {
    const newPreference: ThemeMode = 
      themePreference === 'light' ? 'dark' : 
      themePreference === 'dark' ? 'system' : 'light';
    setThemePreference(newPreference);
  };

  // 直接设置特定主题
  const setTheme = (theme: ThemeMode) => {
    setThemePreference(theme);
  };

  // 监听系统主题变化和初始化主题
  useEffect(() => {
    // 根据当前偏好设置主题
    if (themePreference === 'system') {
      applyTheme(detectSystemTheme());
    } else {
      applyTheme(themePreference);
    }

    // 如果是系统主题，监听系统主题变化
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themePreference]);

  return {
    theme: activeTheme,
    themePreference,
    setTheme,
    toggleTheme,
    isDark: activeTheme === 'dark',
    isLight: activeTheme === 'light',
    isSystem: themePreference === 'system'
  };
} 