'use client';

import { createContext, useContext, useState, useEffect, ReactNode, FC, useCallback, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import client from '../lib/apolloClient'; // 导入Apollo Client实例
import { logApiError, logDataError } from '../utils/errorLogger';

// 定义图表数据的类型接口 (与GraphQL schema中的ChartDataItem一致)
export interface ChartDataItemGQL {
  date: string;
  daily_air_time?: number | null;
  daily_block_time?: number | null;
  daily_fc?: number | null;
  daily_flight_leg?: number | null;
  daily_utilization_air_time?: number | null;
  daily_utilization_block_time?: number | null;
  cumulative_air_time?: number | null;
  cumulative_block_time?: number | null;
  cumulative_fc?: number | null;
  cumulative_flight_leg?: number | null;
  cumulative_daily_utilization_air_time?: number | null;
  cumulative_daily_utilization_block_time?: number | null;
  failure_rate_per_1000_hours?: number | null;
  dispatch_reliability?: number | null;
  sdr_rate_per_1000_hours?: number | null;
  availability_rate?: number | null;
}

// 定义Context状态的类型
interface ChartDataContextState {
  combinedData: ChartDataItemGQL[];
  loading: boolean;
  error: string | null;
  isRetrying: boolean; // 在GraphQL中，重试由useQuery的refetch处理
  isLatestDay: boolean;
  latestDate: string | null;
  fetchData?: () => Promise<void>; // fetchData将通过useQuery的refetch实现
  handleRetry?: () => void; // handleRetry将通过useQuery的refetch实现
  refetch?: () => void; // 添加refetch方法
}

// GraphQL 查询语句
const GET_CHART_DATA = gql`
  query GetChartData {
    chartData {
      combinedData {
        date
        daily_air_time
        daily_block_time
        daily_fc
        daily_flight_leg
        daily_utilization_air_time
        daily_utilization_block_time
        cumulative_air_time
        cumulative_block_time
        cumulative_fc
        cumulative_flight_leg
        cumulative_daily_utilization_air_time
        cumulative_daily_utilization_block_time
        failure_rate_per_1000_hours
        dispatch_reliability
        sdr_rate_per_1000_hours
        availability_rate
      }
      isLatestDay
      latestDate
    }
  }
`;

// 创建Context，提供一个默认值
const ChartDataContext = createContext<ChartDataContextState | undefined>(undefined);

// 定义Provider Props
interface ChartDataProviderProps {
  children: ReactNode;
}

/**
 * ChartDataProvider组件
 * 负责通过GraphQL获取、处理和提供图表数据及相关状态
 */
export const ChartDataProvider: FC<ChartDataProviderProps> = ({ children }) => {
  const { data, loading: apolloLoading, error: apolloError, refetch } = useQuery(GET_CHART_DATA, {
    client: client, // 明确指定client实例
    notifyOnNetworkStatusChange: true, // 网络状态变化时通知组件
  });
  
  // 管理加载状态和重试状态
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  
  // 记录初始加载时间作为参考
  const loadingStartTimeRef = useRef<number>(Date.now());

  // 将Apollo的错误对象转换为字符串消息
  const error = apolloError ? apolloError.message : null;

  // 从GraphQL响应中提取数据
  const combinedData = data?.chartData?.combinedData || [];
  const isLatestDay = data?.chartData?.isLatestDay || false;
  const latestDate = data?.chartData?.latestDate || null;

  // 处理重试逻辑
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setLoading(true); // 重新开始加载
    loadingStartTimeRef.current = Date.now(); // 重置加载开始时间
    
    try {
      await refetch();
      
      // 添加延迟以确保UI更新完成
      setTimeout(() => {
        setLoading(false);
        setIsRetrying(false);
        setDataFetched(true);
      }, 300);
    } catch (e: any) {
      logApiError(e, '/api/graphql (retry)', { query: GET_CHART_DATA.loc?.source.body });
      setLoading(false);
      setIsRetrying(false);
      setDataFetched(true);
    }
  }, [refetch]);

  // 记录API错误
  useEffect(() => {
    if (apolloError) {
      logApiError(apolloError, '/api/graphql', { query: GET_CHART_DATA.loc?.source.body });
    }
  }, [apolloError]);
  
  // 监控Apollo加载状态的变化
  useEffect(() => {
    if (!apolloLoading && !dataFetched) {
      // 数据加载完成
      setDataFetched(true);
      
      // 添加延迟以确保UI更新完成
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [apolloLoading, dataFetched]);
  
  // 添加超时保护，防止加载状态无限持续
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      const loadingDuration = Date.now() - loadingStartTimeRef.current;
      if (loading && loadingDuration > 10000) { // 10秒超时
        console.warn('图表数据加载超时，强制关闭加载状态');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  const contextValue: ChartDataContextState = {
    combinedData,
    loading,
    error,
    isRetrying,
    isLatestDay,
    latestDate,
    refetch: handleRetry, // 将refetch暴露为context的一部分，方便子组件调用
  };

  return (
    <ChartDataContext.Provider value={contextValue}>
      {children}
    </ChartDataContext.Provider>
  );
};

/**
 * 自定义Hook: useChartData
 * 用于在组件中方便地访问ChartDataContext
 */
export const useChartData = (): ChartDataContextState => {
  const context = useContext(ChartDataContext);
  if (context === undefined) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
}; 