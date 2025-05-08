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
  // 使用ref存储所有状态和性能数据，避免不必要的重渲染
  const stateRef = useRef({
    renderStartTime: null as number | null,
    performanceStats: null as ChartPerformanceStats | null,
    hasPerformanceIssue: false,
    dataPointCount: 0
  });
  
  // 仅在UI需要更新时使用state
  const [performanceStats, setPerformanceStats] = useState<ChartPerformanceStats | null>(null);
  
  // 计算数据点数量并存储在ref中
  useEffect(() => {
    const dataPointCount = data ? data.length * seriesCount : 0;
    stateRef.current.dataPointCount = dataPointCount;
  }, [data, seriesCount]);
  
  // 判断是否存在性能问题
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

  // 开始渲染计时 - 使用空依赖数组仅创建一次函数实例
  const startRender = useCallback(() => {
    try {
      // 只有在尚未开始计时时才设置开始时间
      if (stateRef.current.renderStartTime === null) {
        stateRef.current.renderStartTime = performance.now();
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

  // 结束渲染计时并收集性能数据 - 使用空依赖数组仅创建一次函数实例
  const endRender = useCallback(() => {
    try {
      if (stateRef.current.renderStartTime === null) return;
      
      const endTime = performance.now();
      const renderTime = endTime - stateRef.current.renderStartTime;
      const dataPointCount = stateRef.current.dataPointCount;
      
      // 尝试获取内存使用情况（仅在支持的浏览器中工作）
      let memoryUsage;
      if (performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
      }
      
      // 创建性能统计对象
      const stats: ChartPerformanceStats = {
        renderTime,
        dataPointCount,
        seriesCount,
        memoryUsage,
      };
      
      // 更新ref和state
      stateRef.current.performanceStats = stats;
      stateRef.current.renderStartTime = null;
      setPerformanceStats(stats);
      
      // 判断性能问题
      const hasIssue = renderTime > 500 || (dataPointCount > 1000 && renderTime > 200);
      stateRef.current.hasPerformanceIssue = hasIssue;
      
      // 性能问题日志记录
      if (hasIssue) {
        console.warn(
          `图表性能问题: ${chartId} - 渲染时间 ${renderTime.toFixed(2)}ms, ${dataPointCount} 数据点`
        );
      }
    } catch (error) {
      // 使用图表错误日志记录性能问题
      logChartError(
        error, 
        `performance-${chartId}`, 
        { 
          action: 'endRender',
          dataPoints: stateRef.current.dataPointCount
        }
      );
    }
  }, [chartId, seriesCount]);

  // 清理函数
  useEffect(() => {
    return () => {
      stateRef.current = {
        renderStartTime: null,
        performanceStats: null,
        hasPerformanceIssue: false,
        dataPointCount: 0
      };
    };
  }, []);

  return {
    startRender,
    endRender,
    performanceStats,
    isPerformanceIssue,
  };
} 