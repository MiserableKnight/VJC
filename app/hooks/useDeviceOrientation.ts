'use client';

import { useState, useEffect, useCallback } from 'react';

export type Orientation = 'portrait' | 'landscape' | 'unknown';

export interface DeviceOrientationData {
  alpha: number | null; // z轴旋转角度 [0, 360)
  beta: number | null;  // x轴旋转角度 [-180, 180)
  gamma: number | null; // y轴旋转角度 [-90, 90)
}

export interface DeviceOrientationOptions {
  onOrientationChange?: (orientation: Orientation) => void;
}

// 扩展DeviceOrientationEvent类型以包含iOS的requestPermission方法
interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

// 定义DeviceOrientationEvent的静态类型
interface DeviceOrientationEventStatic {
  new(type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
  prototype: DeviceOrientationEvent;
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

/**
 * 检测和响应设备方向变化的钩子
 * 
 * @param options 配置选项
 * @returns 设备方向相关信息
 */
export function useDeviceOrientation(options: DeviceOrientationOptions = {}) {
  const { onOrientationChange } = options;
  
  // 当前屏幕方向
  const [orientation, setOrientation] = useState<Orientation>('unknown');
  
  // 设备方向数据
  const [orientationData, setOrientationData] = useState<DeviceOrientationData>({
    alpha: null,
    beta: null,
    gamma: null
  });
  
  // 是否支持设备方向API
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  // 判断屏幕方向
  const determineOrientation = useCallback(() => {
    if (typeof window === 'undefined') {
      return 'unknown';
    }
    
    // 使用窗口尺寸判断方向
    const { innerWidth, innerHeight } = window;
    
    const newOrientation: Orientation = innerWidth > innerHeight 
      ? 'landscape' 
      : 'portrait';
    
    if (newOrientation !== orientation) {
      setOrientation(newOrientation);
      if (onOrientationChange) {
        onOrientationChange(newOrientation);
      }
    }
    
    return newOrientation;
  }, [orientation, onOrientationChange]);
  
  // 处理设备方向事件
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientationData({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    });
  }, []);
  
  // 请求设备方向权限 (iOS 13+)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      return false;
    }
    
    // 扩展DeviceOrientationEvent类型
    const DeviceOrientationEventCast = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    
    // 检查是否需要请求权限 (iOS 13+)
    if (
      DeviceOrientationEventCast.requestPermission && 
      typeof DeviceOrientationEventCast.requestPermission === 'function'
    ) {
      try {
        const permission = await DeviceOrientationEventCast.requestPermission();
        
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleDeviceOrientation);
          setIsSupported(true);
          return true;
        } else {
          setIsSupported(false);
          return false;
        }
      } catch (error) {
        console.error('无法请求设备方向权限:', error);
        setIsSupported(false);
        return false;
      }
    } else {
      // 不需要权限的设备
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      setIsSupported(true);
      return true;
    }
  }, [handleDeviceOrientation]);
  
  // 初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 初始方向检测
    determineOrientation();
    
    // 监听窗口调整大小事件以检测方向变化
    window.addEventListener('resize', determineOrientation);
    
    // 检查设备方向支持
    const isOrientationSupported = 'DeviceOrientationEvent' in window;
    setIsSupported(isOrientationSupported);
    
    // 对不需要权限的设备，直接添加监听器
    if (isOrientationSupported) {
      const DeviceOrientationEventCast = window.DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
      
      if (
        !DeviceOrientationEventCast.requestPermission || 
        typeof DeviceOrientationEventCast.requestPermission !== 'function'
      ) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    }
    
    // 监听屏幕方向变化事件
    if ('orientation' in window || 'onorientationchange' in window) {
      window.addEventListener('orientationchange', determineOrientation);
    }
    
    return () => {
      window.removeEventListener('resize', determineOrientation);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      
      if ('orientation' in window || 'onorientationchange' in window) {
        window.removeEventListener('orientationchange', determineOrientation);
      }
    };
  }, [determineOrientation, handleDeviceOrientation]);
  
  return {
    orientation,
    orientationData,
    isSupported,
    requestPermission,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
}

export default useDeviceOrientation; 