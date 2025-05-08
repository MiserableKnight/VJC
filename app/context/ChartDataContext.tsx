'use client';

import { createContext, useContext, useState, useEffect, ReactNode, FC, useCallback } from 'react';
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
  const { data, loading, error: apolloError, refetch } = useQuery(GET_CHART_DATA, {
    client: client, // 明确指定client实例
    notifyOnNetworkStatusChange: true, // 网络状态变化时通知组件
  });

  const [isRetrying, setIsRetrying] = useState(false); // 用于UI显示重试状态

  // 将Apollo的错误对象转换为字符串消息
  const error = apolloError ? apolloError.message : null;

  // 从GraphQL响应中提取数据
  const combinedData = data?.chartData?.combinedData || [];
  const isLatestDay = data?.chartData?.isLatestDay || false;
  const latestDate = data?.chartData?.latestDate || null;

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } catch (e: any) {
      logApiError(e, '/api/graphql (retry)', { query: GET_CHART_DATA.loc?.source.body });
      // 错误已由useQuery的error状态处理
    }
    setIsRetrying(false);
  }, [refetch]);

  // 记录API错误
  useEffect(() => {
    if (apolloError) {
      logApiError(apolloError, '/api/graphql', { query: GET_CHART_DATA.loc?.source.body });
    }
  }, [apolloError]);

  const contextValue: ChartDataContextState = {
    combinedData,
    loading,
    error,
    isRetrying,
    isLatestDay,
    latestDate,
    refetch: handleRetry, // 将refetch暴露为context的一部分，方便子组件调用
    // fetchData和handleRetry现在通过refetch实现，如果旧的接口还需要，可以映射到refetch
    // fetchData: handleRetry, 
    // handleRetry: handleRetry,
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