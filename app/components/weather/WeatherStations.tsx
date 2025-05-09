'use client';

import { WeatherCard } from './WeatherCard';

interface WeatherStation {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  url: string;
}

export function WeatherStations() {
  // 定义三个机场的天气站点，添加经纬度信息
  const weatherStations: WeatherStation[] = [
    {
      id: 'hanoi',
      name: '河内',
      code: 'VVNB',
      latitude: 21.2187,
      longitude: 105.8047,
      url: 'https://www.windy.com/airport/VVNB?rain,21.170,105.819,11'
    },
    {
      id: 'hochiminh',
      name: '胡志明',
      code: 'VVTS',
      latitude: 10.8187,
      longitude: 106.6647,
      url: 'https://www.windy.com/airport/VVTS?rain,10.764,106.799,9'
    },
    {
      id: 'condao',
      name: '昆岛',
      code: 'VVCS',
      latitude: 8.7325,
      longitude: 106.62889,
      url: 'https://www.windy.com/zh/-%E8%8F%9C%E5%8D%95/menu?rain,8.990,106.170,8'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      {/* 使用flex-col在移动端强制上下排列，只在大屏幕(lg:)使用网格布局 */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {weatherStations.map((station) => (
          <WeatherCard
            key={station.id}
            name={station.name}
            code={station.code}
            latitude={station.latitude}
            longitude={station.longitude}
            url={station.url}
          />
        ))}
      </div>
    </div>
  );
} 