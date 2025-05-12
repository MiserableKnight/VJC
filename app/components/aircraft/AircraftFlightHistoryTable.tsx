'use client';

import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { isOperationalHours, formatDateDash, getChinaTime, getTodayForDisplay, isSameDay } from '../../utils/dateUtils';

interface FlightHistoryEntry {
  id: string;
  date: string;
  fromAirport: string;
  fromCode: string;
  toAirport: string;
  toCode: string;
  flightNumber: string;
  flightTime: string;
  scheduledDeparture: string;
  actualDeparture: string;
  scheduledArrival: string;
  status: string;
}

// GraphQL查询 - 获取飞行历史
const GET_AIRCRAFT_FLIGHT_HISTORY = gql`
  query GetAircraftFlightHistory($registration: String!) {
    getAircraftFlightHistory(registration: $registration) {
      id
      date
      fromAirport
      fromCode
      toAirport
      toCode
      flightNumber
      flightTime
      scheduledDeparture
      actualDeparture
      scheduledArrival
      status
    }
  }
`;

export function AircraftFlightHistoryTable({ registration }: { registration: string }) {
  // 上次刷新时间状态
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isOperationalTime, setIsOperationalTime] = useState<boolean>(isOperationalHours());
  
  // 更新运行时间状态
  useEffect(() => {
    const checkTime = () => {
      setIsOperationalTime(isOperationalHours());
    };
    
    // 立即检查一次
    checkTime();
    
    // 每分钟检查一次
    const timeCheckInterval = setInterval(checkTime, 60000);
    
    return () => {
      clearInterval(timeCheckInterval);
    };
  }, []);
  
  // 实际使用GraphQL查询，添加轮询功能
  const { loading, error, data, refetch } = useQuery(GET_AIRCRAFT_FLIGHT_HISTORY, {
    variables: { registration }
  });
  
  // 输出完整的API返回数据用于调试
  console.log(`API响应数据 (${registration}):`, data?.getAircraftFlightHistory);
  
  const flightHistory: FlightHistoryEntry[] = data?.getAircraftFlightHistory || [];
  
  // 获取今天的日期格式与API匹配的格式
  const todayForDisplay = getTodayForDisplay();

  // 筛选当天的飞行记录
  const todayFlights = flightHistory.filter(flight => {
    // 使用更可靠的日期比较函数
    const isToday = isSameDay(flight.date, todayForDisplay);
    console.log(`航班日期检查: "${flight.date}" 是否为今天 "${todayForDisplay}": ${isToday}`);
    return isToday;
  });
  
  // 输出日志用于调试
  console.log(`${registration}: 总共获取到${flightHistory.length}条记录，今日航班${todayFlights.length}条`);
  
  // 设置自动刷新定时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh && isOperationalTime) {
      intervalId = setInterval(() => {
        refetch();
        setLastRefresh(new Date());
      }, 10000); // 每10秒刷新一次
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refetch, autoRefresh, isOperationalTime]);
  
  // 手动刷新函数
  const handleManualRefresh = () => {
    // 手动刷新不受时间限制
    refetch();
    setLastRefresh(new Date());
  };
  
  // 切换自动刷新状态
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  if (loading && todayFlights.length === 0) return (
    <div className="w-full flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error && todayFlights.length === 0) return (
    <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
      <p className="font-bold">获取数据出错</p>
      <p className="text-sm">{error.message}</p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-800">
          {registration === "B-652G" ? "B-652G（185）" : registration === "B-656E" ? "B-656E（196）" : `${registration} 今日飞行`}
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在刷新...
              </span>
            ) : (
              `上次更新: ${lastRefresh.toLocaleTimeString()}`
            )}
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-1 rounded-md hover:bg-blue-100 text-blue-600 disabled:opacity-50"
            title="手动刷新"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            onClick={toggleAutoRefresh}
            className={`p-1 rounded-md ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:opacity-80`}
            title={autoRefresh ? "关闭自动刷新" : "开启自动刷新"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                出发地
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                目的地
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                航班号
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                飞行时间
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                计划起飞
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                实际起飞
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                计划到达
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {todayFlights.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  今日暂无飞行数据
                </td>
              </tr>
            ) : (
              todayFlights.map((flight: FlightHistoryEntry) => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flight.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.fromAirport} ({flight.fromCode})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.toAirport} ({flight.toCode})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {flight.flightNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.flightTime}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.scheduledDeparture}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.actualDeparture}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.scheduledArrival}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${flight.status.includes('Landed') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {flight.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t flex justify-between items-center">
        <span>数据来源: 系统内置模拟数据</span>
        <div className="flex items-center gap-2">
          <span className={`${autoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
            {autoRefresh ? '自动刷新已启用 (10秒)' : '自动刷新已关闭'}
          </span>
          {!isOperationalTime && autoRefresh && (
            <span className="text-orange-500 ml-2">
              （非运行时间: 仅在北京时间7:45-22:00之间自动刷新）
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 