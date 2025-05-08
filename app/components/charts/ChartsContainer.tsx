'use client';

import { FC } from 'react';
import { useChartData, ChartDataItemGQL } from '../../context/ChartDataContext'; // 导入新的Context Hook和类型
import { AirTimeChart } from './AirTimeChart';
import { UtilizationChart } from './UtilizationChart';
import { FlightCycleChart } from './FlightCycleChart';
import { LazyChart } from './LazyChart';
import { formatDate } from '../../utils/chartUtils';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * 图表容器组件
 * 负责从ChartDataContext消费数据和状态，并渲染各个图表组件
 */
export const ChartsContainer: FC = () => {
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

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  /**
   * 加载中状态显示
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg sm:text-xl">{isRetrying ? '正在重新获取数据...' : '加载中...'}</p>
        </div>
      </div>
    );
  }

  /**
   * 错误状态显示
   */
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-red-50 p-3 sm:p-6 rounded-lg border border-red-200">
        <p className="text-red-500 mb-2 sm:mb-4 text-center">{error}</p>
        <p className="text-gray-600 mb-3 sm:mb-6">可能的原因:</p>
        <ul className="list-disc text-gray-600 mb-4 sm:mb-8 pl-5">
          <li>GraphQL API 服务暂时不可用</li>
          <li>网络连接问题</li>
          <li>数据库查询错误</li>
        </ul>
        <button 
          onClick={handleRetry} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isRetrying}
        >
          {isRetrying ? '重试中...' : '重试'}
        </button>
      </div>
    );
  }

  /**
   * 无数据状态显示
   */
  if (!combinedData || combinedData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-yellow-50 p-3 sm:p-6 rounded-lg border border-yellow-200">
        <div className="text-center">
          <p className="text-lg text-yellow-700 mb-4">数据库中没有找到数据，或GraphQL查询未返回数据。</p>
          <button 
            onClick={handleRetry} 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            disabled={isRetrying} // 添加disabled状态，防止重复点击
          >
            {isRetrying ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </div>
    );
  }

  /**
   * 渲染图表
   */
  return (
    <div className="space-y-4 sm:space-y-16 max-w-7xl mx-auto">
      <ErrorBoundary fallback={
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-800 mb-2">空时数据图表加载错误</h3>
          <p className="text-red-600 mb-4">图表渲染时发生错误</p>
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            重新加载
          </button>
        </div>
      }>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="air-time-chart"
        >
          {/* @ts-ignore TODO: 修复类型 */} 
          <AirTimeChart data={combinedData as ChartDataItemGQL[]} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-800 mb-2">日利用率图表加载错误</h3>
          <p className="text-red-600 mb-4">图表渲染时发生错误</p>
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            重新加载
          </button>
        </div>
      }>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="utilization-chart"
        >
          {/* @ts-ignore TODO: 修复类型 */} 
          <UtilizationChart data={combinedData as ChartDataItemGQL[]} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-medium text-red-800 mb-2">飞行循环图表加载错误</h3>
          <p className="text-red-600 mb-4">图表渲染时发生错误</p>
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            重新加载
          </button>
        </div>
      }>
        <LazyChart 
          height="h-[450px] sm:h-[450px] md:h-[550px]"
          rootMargin="200px 0px"
          id="flight-cycle-chart"
        >
          {/* @ts-ignore TODO: 修复类型 */} 
          <FlightCycleChart data={combinedData as ChartDataItemGQL[]} onRefresh={handleRetry} />
        </LazyChart>
      </ErrorBoundary>
      
      {/* 在页面底部添加提示信息 */}
      {isLatestDay && latestDate && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-12 rounded-r-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">数据更新说明：</p>
              <p>当日数据会在21:00之后更新。最新数据日期: {formatDate(latestDate)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 