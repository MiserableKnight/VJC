'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChartDataItemGQL } from '../context/ChartDataContext';
import { logChartError } from '../utils/errorLogger';

// 图表性能统计类型
interface ChartPerformanceStats {
  renderTime: number;
  dataPointCount: number;
  seriesCount: number;
  memoryUsage?: number;
}

// 钩子函数接口
interface UseChartPerformanceResult {
  startRender: () => void;
  endRender: () => void;
  performanceStats: ChartPerformanceStats | null;
  isPerformanceIssue: boolean;
}

// 性能错误信息类型
interface PerformanceErrorInfo {
  component: string;
  type: string;
}

/**
 * 图表性能监控自定义钩子
 * 用于监控图表渲染性能，并提供优化建议
 */
export function useChartPerformance(
  chartId: string,
  data?: ChartDataItemGQL[],
  seriesCount = 1
): UseChartPerformanceResult {
  // 使用useRef而不是useState来存储开始时间，避免触发重新渲染
  const renderStartTimeRef = useRef<number | null>(null);
  const [performanceStats, setPerformanceStats] = useState<ChartPerformanceStats | null>(null);

  // 使用useMemo计算数据点数量，避免重复计算
  const dataPointCount = useMemo(() => {
    if (!data) return 0;
    return data.length * seriesCount;
  }, [data, seriesCount]);

  // 使用useMemo判断是否存在性能问题
  const isPerformanceIssue = useMemo(() => {
    if (!performanceStats) return false;
    
    // 根据经验值判断性能问题
    const { renderTime, dataPointCount } = performanceStats;
    
    // 大于500ms的渲染时间被认为可能存在性能问题
    if (renderTime > 500) return true;
    
    // 大量数据点且渲染时间超过200ms
    if (dataPointCount > 1000 && renderTime > 200) return true;
    
    return false;
  }, [performanceStats]);

  // 开始渲染计时 - 使用useCallback避免函数重新创建
  const startRender = useCallback(() => {
    try {
      // 只有在尚未开始计时时才设置开始时间
      if (renderStartTimeRef.current === null) {
        renderStartTimeRef.current = performance.now();
      }
    } catch (error) {
      // 使用图表错误日志记录性能问题
      logChartError(
        error, 
        `performance-${chartId}`, 
        { action: 'startRender' }
      );
    }
  }, [chartId]);

  // 结束渲染计时并收集性能数据 - 使用useCallback避免函数重新创建
  const endRender = useCallback(() => {
    try {
      if (renderStartTimeRef.current === null) return;
      
      const endTime = performance.now();
      const renderTime = endTime - renderStartTimeRef.current;
      
      // 尝试获取内存使用情况（仅在支持的浏览器中工作）
      let memoryUsage;
      if (performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
      }
      
      // 更新性能统计
      setPerformanceStats({
        renderTime,
        dataPointCount,
        seriesCount,
        memoryUsage,
      });
      
      // 重置开始时间，准备下次渲染测量
      renderStartTimeRef.current = null;
      
      // 性能问题日志记录
      if (
        renderTime > 500 || 
        (dataPointCount > 1000 && renderTime > 200)
      ) {
        console.warn(`Chart performance issue detected for ${chartId}: ${renderTime.toFixed(2)}ms, ${dataPointCount} data points`);
      }
    } catch (error) {
      // 使用图表错误日志记录性能问题
      logChartError(
        error, 
        `performance-${chartId}`, 
        { 
          action: 'endRender',
          dataPoints: dataPointCount
        }
      );
    }
  }, [chartId, dataPointCount, seriesCount]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理状态
      renderStartTimeRef.current = null;
      setPerformanceStats(null);
    };
  }, []);

  return {
    startRender,
    endRender,
    performanceStats,
    isPerformanceIssue,
  };
} 