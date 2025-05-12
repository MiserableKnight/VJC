'use client';

import { useState, useEffect } from 'react';
import { isOperationalHours, formatDateDash, getChinaTime, getTodayForDisplay } from '../../utils/dateUtils';

interface FR24FlightData {
  date: string;
  from: {
    name: string;
    code: string;
  };
  to: {
    name: string;
    code: string;
  };
  flight: string;
  flightTime: string;
  std: string; // 计划出发时间
  atd: string; // 实际出发时间
  sta: string; // 计划到达时间
  status: string; // 状态，如 "Landed 07:12"
}

export function FlightRadar24DataTable({ 
  registration, 
  data 
}: { 
  registration: string; 
  data?: FR24FlightData[] 
}) {
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

  // 设置自动刷新定时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh && isOperationalTime) {
      intervalId = setInterval(() => {
        // 这里应该添加实际的数据刷新逻辑
        // 例如：fetchData(); 
        setLastRefresh(new Date());
      }, 10000); // 每10秒刷新一次
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, isOperationalTime]);
  
  // 手动刷新函数
  const handleManualRefresh = () => {
    // 手动刷新不受时间限制
    // 这里应该添加实际的数据刷新逻辑
    // 例如：fetchData();
    setLastRefresh(new Date());
  };
  
  // 切换自动刷新状态
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  // 如果没有提供数据，使用模拟数据（基于Flightradar24的注册号）
  const mockDataMap: {[key: string]: FR24FlightData[]} = {
    'B-652G': [
      {
        date: getTodayForDisplay(),
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Hanoi', code: 'HAN' },
        flight: 'VJ102',
        flightTime: '2:03',
        std: '04:35',
        atd: '05:08',
        sta: '06:50',
        status: 'Landed 07:12'
      },
      {
        date: getTodayForDisplay(),
        from: { name: 'Ho Chi Minh City', code: 'SGN' },
        to: { name: 'Con Dao', code: 'VCS' },
        flight: 'VJ115',
        flightTime: '0:40',
        std: '03:30',
        atd: '03:58',
        sta: '04:10',
        status: 'Landed 04:38'
      },
      {
        date: getTodayForDisplay(),
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Ho Chi Minh City', code: 'SGN' },
        flight: 'VJ114',
        flightTime: '0:38',
        std: '02:20',
        atd: '02:32',
        sta: '03:05',
        status: 'Landed 03:09'
      },
      {
        date: '09 May 2025',
        from: { name: 'Hanoi', code: 'HAN' },
        to: { name: 'Con Dao', code: 'VCS' },
        flight: 'VJ101',
        flightTime: '2:00',
        std: '23:45',
        atd: '23:55',
        sta: '01:55',
        status: 'Landed 01:55'
      },
      {
        date: '09 May 2025',
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Hanoi', code: 'HAN' },
        flight: 'VJ102',
        flightTime: '2:04',
        std: '04:35',
        atd: '05:14',
        sta: '06:50',
        status: 'Landed 07:18'
      }
    ],
    'B-656E': [
      {
        date: getTodayForDisplay(),
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Hanoi', code: 'HAN' },
        flight: 'VJ104',
        flightTime: '2:01',
        std: '07:05',
        atd: '07:30',
        sta: '09:20',
        status: 'Landed 09:32'
      },
      {
        date: getTodayForDisplay(),
        from: { name: 'Ho Chi Minh City', code: 'SGN' },
        to: { name: 'Con Dao', code: 'VCS' },
        flight: 'VJ117',
        flightTime: '0:33',
        std: '06:00',
        atd: '06:30',
        sta: '06:40',
        status: 'Landed 07:04'
      },
      {
        date: getTodayForDisplay(),
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Ho Chi Minh City', code: 'SGN' },
        flight: 'VJ116',
        flightTime: '0:40',
        std: '04:50',
        atd: '05:02',
        sta: '05:35',
        status: 'Landed 05:42'
      },
      {
        date: '09 May 2025',
        from: { name: 'Hanoi', code: 'HAN' },
        to: { name: 'Con Dao', code: 'VCS' },
        flight: 'VJ103',
        flightTime: '1:59',
        std: '02:15',
        atd: '02:27',
        sta: '04:25',
        status: 'Landed 04:25'
      },
      {
        date: '09 May 2025',
        from: { name: 'Con Dao', code: 'VCS' },
        to: { name: 'Hanoi', code: 'HAN' },
        flight: 'VJ104',
        flightTime: '2:04',
        std: '07:05',
        atd: '07:45',
        sta: '09:20',
        status: 'Landed 09:49'
      }
    ]
  };

  // 使用提供的数据或注册号对应的模拟数据，如果都没有则使用默认数据
  const flightData = data || 
    (registration && mockDataMap[registration]) || 
    mockDataMap['B-652G'];
  
  // 只显示当天的数据
  const today = formatDateDash(getChinaTime()).split('-').reverse().join(' ');
  const todayFormatted = today.replace(/^0/, ''); // 移除日期前面的0，例如 "05" 变成 "5"
  
  // 筛选当天的飞行记录
  const todayFlightData = flightData.filter(flight => {
    return flight.date.includes(todayFormatted);
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(todayFlightData.length / pageSize);
  
  // 获取当前页数据
  const currentData = todayFlightData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // 切换页面
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-blue-800">
            {registration} - 今日Flightradar24数据
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            显示从Flightradar24获取的今日航班数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            上次更新: {lastRefresh.toLocaleTimeString()}
          </div>
          <button 
            onClick={handleManualRefresh}
            className="p-1 rounded-md hover:bg-blue-100 text-blue-600"
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
                始发地
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
                计划出发
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                实际出发
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
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  今日暂无飞行数据
                </td>
              </tr>
            ) : (
              currentData.map((flight, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flight.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.from.name} ({flight.from.code})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.to.name} ({flight.to.code})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {flight.flight}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.flightTime}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.std}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.atd}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {flight.sta}
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
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              上一页
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 至 <span className="font-medium">{Math.min(currentPage * pageSize, todayFlightData.length)}</span> 条，共 <span className="font-medium">{todayFlightData.length}</span> 条结果
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">上一页</span>
                  ← 
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === i + 1 ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">下一页</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t flex justify-between items-center">
        <span>数据来源: Flightradar24</span>
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