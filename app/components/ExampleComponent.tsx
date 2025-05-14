'use client';

import React from 'react';
import { useQueryFetch } from '../hooks/useQueryFetch';
import { useSwrFetch } from '../hooks/useSwrFetch';
import { useResponsive } from '../hooks/useResponsive';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIncrementalUpdate } from '../utils/incrementalUpdate';

interface FlightData {
  id: string;
  flightNumber: string;
  status: string;
  // 更多字段...
}

export default function ExampleComponent() {
  // 使用响应式Hook
  const { isMobile, isTablet, isDesktop, lg } = useResponsive();
  
  // 使用本地存储
  const [userPreferences, setUserPreferences] = useLocalStorage('user_preferences', {
    darkMode: false,
    language: 'zh_CN'
  });
  
  // 切换深色模式
  const toggleDarkMode = () => {
    setUserPreferences({
      ...userPreferences,
      darkMode: !userPreferences.darkMode
    });
  };
  
  // 使用增量更新
  const [flightsUrl, updateLastFlightSync, resetFlightsSync] = useIncrementalUpdate(
    'flights',
    '/api/flights'
  );
  
  // 使用React Query获取数据
  const {
    data: flightsData,
    isLoading: isLoadingFlights,
    error: flightsError,
    refetch: refetchFlights
  } = useQueryFetch<FlightData[]>('flights', flightsUrl);
  
  // 处理成功获取数据后的更新
  React.useEffect(() => {
    if (flightsData) {
      // 更新最后同步时间
      updateLastFlightSync();
    }
  }, [flightsData]);
  
  // 使用SWR获取其他数据
  const {
    data: weatherData,
    error: weatherError,
    isLoading: isLoadingWeather,
    refresh: refreshWeather
  } = useSwrFetch('/api/weather');
  
  // 根据屏幕尺寸调整UI
  const contentClass = isMobile 
    ? 'p-2 text-sm' 
    : isTablet 
      ? 'p-4 text-base' 
      : 'p-6 text-lg';
  
  // 渲染加载状态
  if (isLoadingFlights || isLoadingWeather) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // 渲染错误状态
  if (flightsError || weatherError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <h2 className="font-bold">获取数据时出错</h2>
        <p>{flightsError?.message || weatherError?.message}</p>
        <button 
          onClick={() => {
            refetchFlights();
            refreshWeather();
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重试
        </button>
      </div>
    );
  }
  
  return (
    <div className={`${contentClass} ${userPreferences.darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">数据看板</h1>
        <button 
          onClick={toggleDarkMode}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {userPreferences.darkMode ? '切换到亮色模式' : '切换到深色模式'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 航班数据 */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">航班数据</h2>
          {flightsData && flightsData.length > 0 ? (
            <ul>
              {flightsData.map(flight => (
                <li key={flight.id} className="mb-2">
                  <span className="font-medium">{flight.flightNumber}</span>: {flight.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>暂无航班数据</p>
          )}
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => refetchFlights()}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              刷新数据
            </button>
            <button 
              onClick={() => {
                resetFlightsSync();
                refetchFlights();
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              完整同步
            </button>
          </div>
        </div>
        
        {/* 天气数据 */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">天气数据</h2>
          {weatherData ? (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(weatherData, null, 2)}
            </pre>
          ) : (
            <p>暂无天气数据</p>
          )}
          <button 
            onClick={() => refreshWeather()}
            className="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            刷新天气
          </button>
        </div>
        
        {/* 仅在桌面显示的内容 */}
        {isDesktop && (
          <div className="border rounded p-4">
            <h2 className="font-bold mb-2">仅桌面版显示</h2>
            <p>这个面板仅在桌面尺寸的屏幕上显示。</p>
          </div>
        )}
      </div>
    </div>
  );
} 