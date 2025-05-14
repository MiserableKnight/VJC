'use client';

import React, { useState, useEffect } from 'react';
import { LegData } from '../../database/models';
import { getTodayFormatted } from '../../utils/dateUtils';

interface AircraftLegDataTableProps {
  registration?: string;
  title?: string;
}

export function AircraftLegDataTable({ registration, title }: AircraftLegDataTableProps) {
  const [legData, setLegData] = useState<LegData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // 格式化机场代码，只保留四字代码
  const formatAirport = (airport: string) => {
    // 假设格式是"ZBAA 北京首都国际机场"，提取ZBAA
    const match = airport.match(/^([A-Z]{4})/);
    return match ? match[1] : airport;
  };

  // 格式化时间，只保留前4位（小时和分钟）
  const formatTime = (time: string) => {
    if (!time) return '';
    // 如果时间格式是 HH:MM:SS，只保留 HH:MM
    const match = time.match(/^(\d{2}:\d{2})/);
    return match ? match[1] : time;
  };

  // 获取航段数据
  useEffect(() => {
    async function fetchLegData() {
      try {
        setLoading(true);
        const response = await fetch('/api/leg-data');
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        // 获取今天的日期
        const today = getTodayFormatted().replace(/\//g, '-');
        
        // 筛选今天的数据，如果指定了registration则按飞机注册号筛选
        const filteredData = (data.legData || []).filter((leg: LegData) => {
          // 转换日期格式以便比较（如果格式不同）
          const legDate = leg.date.replace(/\//g, '-');
          const isToday = legDate === today;
          
          if (registration) {
            return isToday && leg.operating_aircraft === registration;
          }
          return isToday;
        });
        
        // 按推出时间（out_time）排序
        const sortedData = [...filteredData].sort((a, b) => {
          // 如果推出时间为空，则排在后面
          if (!a.out_time) return 1;
          if (!b.out_time) return -1;
          
          // 将时间格式转换为可比较的格式（假设格式为HH:MM或类似格式）
          return a.out_time.localeCompare(b.out_time);
        });
        
        setLegData(sortedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取航段数据失败');
        console.error('获取航段数据出错:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLegData();
  }, [registration]);

  // 加载状态
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        <p className="font-bold text-lg">获取数据出错</p>
        <p className="text-base">{error}</p>
      </div>
    );
  }

  // 没有数据
  if (legData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-center text-lg">
        {registration ? `${registration} 今日暂无航段数据` : '今日暂无航段数据'}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden pb-2">
      {title && <h3 className="text-xl font-medium mb-2">{title}</h3>}
      <div className="text-base text-gray-500 mb-2">
        最后更新时间: {lastUpdated}
      </div>
      <div className="overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 whitespace-nowrap table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[90px]">
                日期
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[90px]">
                航班号
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                起飞
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                降落
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                推出
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                起飞
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                落地
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                到位
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {legData.map((leg, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {leg.date}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-semibold text-blue-600 text-center">
                  {leg.flight_number}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatAirport(leg.departure_airport)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatAirport(leg.arrival_airport)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatTime(leg.out_time)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatTime(leg.off_time)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatTime(leg.on_time)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatTime(leg.in_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 