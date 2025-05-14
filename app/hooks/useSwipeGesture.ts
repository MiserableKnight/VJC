'use client';

import { useRef, useCallback, useState } from 'react';

export interface SwipeDirection {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void; 
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number;
  velocity?: number;
  preventScrollOnSwipeY?: boolean;
}

interface TouchData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
}

/**
 * 处理移动端滑动手势的钩子
 */
export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
    threshold = 50,
    velocity = 0.3,
    preventScrollOnSwipeY = false
  } = options;

  // 存储触摸数据
  const touchData = useRef<TouchData>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    endTime: 0
  });

  // 当前滑动状态
  const [swiping, setSwiping] = useState(false);

  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: Date.now(),
      endTime: Date.now()
    };
    setSwiping(true);
  }, []);

  // 处理触摸移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    
    const touch = e.touches[0];
    touchData.current.endX = touch.clientX;
    touchData.current.endY = touch.clientY;
    touchData.current.endTime = Date.now();

    // 检查是否需要阻止垂直滚动
    if (preventScrollOnSwipeY) {
      const deltaY = Math.abs(touchData.current.endY - touchData.current.startY);
      if (deltaY > threshold) {
        e.preventDefault();
      }
    }
  }, [swiping, threshold, preventScrollOnSwipeY]);

  // 处理触摸结束
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    
    const { startX, startY, endX, endY, startTime, endTime } = touchData.current;
    
    // 计算位移和时间差
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const timeElapsed = endTime - startTime;
    
    // 计算速度 (像素/毫秒)
    const velocityX = Math.abs(deltaX) / timeElapsed;
    const velocityY = Math.abs(deltaY) / timeElapsed;
    
    // 确定滑动方向
    const swipeDirection: SwipeDirection = {
      left: deltaX < -threshold && velocityX > velocity,
      right: deltaX > threshold && velocityX > velocity,
      up: deltaY < -threshold && velocityY > velocity,
      down: deltaY > threshold && velocityY > velocity
    };
    
    // 触发相应的回调
    if (swipeDirection.left && onSwipeLeft) {
      onSwipeLeft();
    }
    
    if (swipeDirection.right && onSwipeRight) {
      onSwipeRight();
    }
    
    if (swipeDirection.up && onSwipeUp) {
      onSwipeUp();
    }
    
    if (swipeDirection.down && onSwipeDown) {
      onSwipeDown();
    }
    
    // 通用滑动回调
    if (onSwipe && (swipeDirection.left || swipeDirection.right || swipeDirection.up || swipeDirection.down)) {
      onSwipe(swipeDirection);
    }
    
    setSwiping(false);
  }, [swiping, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]);

  // 处理触摸取消
  const handleTouchCancel = useCallback(() => {
    setSwiping(false);
  }, []);

  // 返回事件处理程序
  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    },
    swiping
  };
}

export default useSwipeGesture; 