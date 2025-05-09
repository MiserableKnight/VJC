'use client';

import React, { FC, useCallback, memo } from 'react';
import { useChartData, ChartDataItemGQL } from '../../context/ChartDataContext'; // 导入新的Context Hook和类型
import { AirTimeChart } from './AirTimeChart';
import { UtilizationChart } from './UtilizationChart';
import { FlightCycleChart } from './FlightCycleChart';
import { LazyChart } from './LazyChart';
import { formatDate } from '../../utils/chartUtils';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * 错误回退组件
 */
const ErrorFallback = memo(({ title, retryHandler }: { title: string, retryHandler: () => void }) => (
  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
    <h3 className="text-xl font-medium text-red-800 mb-3">{title}加载错误</h3>
    <p className="text-lg text-red-600 mb-4">图表渲染时发生错误</p>
    <button
      onClick={retryHandler}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    >
      重新加载
    </button>
  </div>
));

/**
 * 加载状态组件
 */
const LoadingState = memo(({ isRetrying }: { isRetrying: boolean }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
      <p className="text-xl">{isRetrying ? '正在重新获取数据...' : '加载中...'}</p>
    </div>
  </div>
));

/**
 * 错误状态组件
 */
const ErrorState = memo(({ error, isRetrying, handleRetry }: { 
  error: string, 
  isRetrying: boolean, 
  handleRetry: () => void 
}) => (
  <div className="flex flex-col justify-center items-center h-64 bg-red-50 p-5 sm:p-6 rounded-lg border border-red-200">
    <p className="text-lg text-red-500 mb-4 text-center">{error}</p>
    <p className="text-lg text-gray-600 mb-4 sm:mb-6">可能的原因:</p>
    <ul className="list-disc text-lg text-gray-600 mb-6 sm:mb-8 pl-5">
      <li>GraphQL API 服务暂时不可用</li>
      <li>网络连接问题</li>
      <li>数据库查询错误</li>
    </ul>
    <button 
      onClick={handleRetry} 
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded text-lg"
      disabled={isRetrying}
    >
      {isRetrying ? '重试中...' : '重试'}
    </button>
  </div>
));

/**
 * 无数据状态组件
 */
const NoDataState = memo(({ isRetrying, handleRetry }: { 
  isRetrying: boolean, 
  handleRetry: () => void 
}) => (
  <div className="flex justify-center items-center h-64 bg-yellow-50 p-5 sm:p-6 rounded-lg border border-yellow-200">
    <div className="text-center">
      <p className="text-lg sm:text-xl text-yellow-700 mb-5">数据库中没有找到数据，或GraphQL查询未返回数据。</p>
      <button 
        onClick={handleRetry} 
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-5 rounded text-lg"
        disabled={isRetrying}
      >
        {isRetrying ? '刷新中...' : '刷新数据'}
      </button>
    </div>
  </div>
));

/**
 * 图表容器组件
 * 负责从ChartDataContext消费数据和状态，并渲染各个图表组件
 */
const ChartsContainerComponent: FC = () => {
  // 从Context中获取数据和状态
  const {
    combinedData,
    loading,
    error,
    isRetrying,
    isLatestDay,
    latestDate,
    refetch, // 获取refetch方法
  } = useChartData();

  const handleRetry = useCallback(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  /**
   * 加载中状态显示
   */
  if (loading) {
    return <LoadingState isRetrying={isRetrying} />;
  }

  /**
   * 错误状态显示
   */
  if (error) {
    return <ErrorState error={error} isRetrying={isRetrying} handleRetry={handleRetry} />;
  }

  /**
   * 无数据状态显示
   */
  if (!combinedData || combinedData.length === 0) {
    return <NoDataState isRetrying={isRetrying} handleRetry={handleRetry} />;
  }

  // 将数据显式转换为ChartDataItemGQL类型
  const chartData = combinedData as ChartDataItemGQL[];

  /**
   * 渲染图表
   */
  return (
    <div className="space-y-8 sm:space-y-16 max-w-7xl mx-auto">
      <ErrorBoundary fallback={<ErrorFallback title="空时数据图表" retryHandler={handleRetry} />}>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="air-time-chart"
        >
          <AirTimeChart data={chartData} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<ErrorFallback title="日利用率图表" retryHandler={handleRetry} />}>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="utilization-chart"
        >
          <UtilizationChart data={chartData} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<ErrorFallback title="飞行循环图表" retryHandler={handleRetry} />}>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="flight-cycle-chart"
        >
          <FlightCycleChart data={chartData} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      {/* 在页面底部添加提示信息 */}
      {isLatestDay && latestDate && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-12 rounded-r-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-lg font-medium">数据更新说明：</p>
              <p className="text-base">当日数据会在21:00之后更新。最新数据日期: {formatDate(latestDate)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 使用memo包装组件，避免不必要的重新渲染
export const ChartsContainer = memo(ChartsContainerComponent); 