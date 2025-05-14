'use client';

import React, { useState, useEffect } from 'react';
import { EconomicData } from '../../database/models';
import { getTodayFormatted } from '../../utils/dateUtils';

interface EconomicDataTableProps {
  registration?: string;
  title?: string;
}

export function EconomicDataTable({ registration, title }: EconomicDataTableProps) {
  const [economicData, setEconomicData] = useState<EconomicData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // 格式化机场代码，只保留四字代码
  const formatAirport = (airport: string) => {
    // 假设格式是"ZBAA 北京首都国际机场"，提取ZBAA
    const match = airport.match(/^([A-Z]{4})/);
    return match ? match[1] : airport;
  };

  // 格式化数字，显示为整数
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '';
    return Math.round(num).toString();
  };

  // 获取经济性数据
  useEffect(() => {
    async function fetchEconomicData() {
      try {
        setLoading(true);
        const response = await fetch('/api/economic-data');
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 按飞机注册号筛选数据
        const filteredData = (data.economicData || []).filter((item: EconomicData) => {
          if (registration) {
            return item.operating_aircraft === registration;
          }
          return true;
        });
        
        // 按推出时间排序（如果有）或航班号排序
        const sortedData = [...filteredData].sort((a, b) => {
          // 如果有out_fuel_kg，则按out_fuel_kg排序（模拟推出时间顺序）
          if (a.out_fuel_kg !== b.out_fuel_kg) {
            return a.out_fuel_kg > b.out_fuel_kg ? -1 : 1;
          }
          // 否则按航班号排序
          return a.flight_number.localeCompare(b.flight_number);
        });
        
        setEconomicData(sortedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取经济性数据失败');
        console.error('获取经济性数据出错:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEconomicData();
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
  if (economicData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700 text-center text-lg">
        {registration ? `${registration} 今日暂无经济性数据` : '今日暂无经济性数据'}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden pb-2">
      {title && <h3 className="text-xl font-medium mb-2">{title}</h3>}
      <div className="text-base text-gray-500 mb-2">
        最后更新时间: {lastUpdated} <span className="ml-2 text-sm text-blue-600">(以下为当地时间)</span>
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
                OUT
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                OFF
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                ON
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[70px]">
                IN
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[90px]">
                空地油耗
              </th>
              <th scope="col" className="px-1 py-3 text-center text-base font-semibold text-gray-700 uppercase tracking-wider w-[90px]">
                空中油耗
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {economicData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {item.date}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-semibold text-blue-600 text-center">
                  {item.flight_number}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatAirport(item.departure_airport)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatAirport(item.arrival_airport)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.out_fuel_kg)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.off_fuel_kg)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.on_fuel_kg)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.in_fuel_kg)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.ground_fuel_consumption)}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-lg font-medium text-gray-900 text-center">
                  {formatNumber(item.air_fuel_consumption)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 