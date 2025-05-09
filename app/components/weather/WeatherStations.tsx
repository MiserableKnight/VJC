'use client';

import { WeatherCard } from './WeatherCard';
import { useResponsive } from '../../hooks/useResponsive';

interface WeatherStation {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  url: string;
}

export function WeatherStations() {
  // 获取视口尺寸信息
  const { width, isMobile, isTablet } = useResponsive();
  
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
  
  // 使用更广泛的条件判断移动设备，确保宽度足够大时才使用多列布局
  const isMobileView = width < 900; // 设置更高的阈值，确保在较大的移动设备上也是单列
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      {/* 调试信息区域 - 仅在开发环境显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <p>屏幕宽度: {width}px</p>
          <p>是否为移动视图: {isMobileView ? '是' : '否'}</p>
          <p>单列布局: {isMobileView ? '启用' : '禁用'}</p>
        </div>
      )}
      
      {/* 使用内联条件判断替代响应式类 */}
      <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-6`}>
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