'use client';

import { useEffect, useState, useRef, MutableRefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * 自定义Hook用于检测元素是否在视口中
 * 基于Intersection Observer API，支持延迟加载组件
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {},
  initialVisible: boolean = false
): [MutableRefObject<T | null>, boolean] {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const targetRef = useRef<T | null>(null);
  
  const { root = null, rootMargin = '0px', threshold = 0 } = options;
  
  useEffect(() => {
    // 如果已经可见，不需要设置观察器
    if (isVisible && initialVisible) return;
    
    const target = targetRef.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入视口，更新状态
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 一旦可见，不再需要观察
          observer.unobserve(target);
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(target);
    
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, isVisible, initialVisible]);
  
  return [targetRef, isVisible];
}

/**
 * 可用于动态样式的Hook，增强用户体验
 * 返回ref和一组类，可以基于可见性应用不同的样式
 */
export function useIntersectionStyles<T extends Element>(
  options: IntersectionObserverOptions = {},
  visibleClass: string = 'opacity-100 transition-opacity duration-500',
  hiddenClass: string = 'opacity-0'
): [MutableRefObject<T | null>, string, boolean] {
  const [targetRef, isVisible] = useIntersectionObserver<T>(options);
  const className = isVisible ? visibleClass : hiddenClass;
  
  return [targetRef, className, isVisible];
}

/**
 * 添加延迟的Hook，用于动画效果
 */
export function useDelayedVisibility<T extends Element>(
  options: IntersectionObserverOptions = {},
  delay: number = 200
): [MutableRefObject<T | null>, boolean] {
  const [targetRef, isIntersecting] = useIntersectionObserver<T>(options);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isIntersecting) {
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isIntersecting, delay]);
  
  return [targetRef, isVisible];
} 