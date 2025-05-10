'use client';

import { useState, useEffect } from 'react';
import { 
  fetchWeatherData, 
  getWeatherDescription, 
  getWindDirection, 
  // Removed getCurrentHourData as we'll display multiple forecasts
  // getCurrentHourData,
  WeatherData,
  DailyForecast
} from '../../services/weatherService';

interface WeatherCardProps {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  url: string;
}

export function WeatherCard({ name, code, latitude, longitude, url }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoading(true);
        const data = await fetchWeatherData(latitude, longitude);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('无法加载天气数据');
        console.error('Error loading weather data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center">
          {/* 加载状态的顶部部分 */}
          <div className="w-full flex justify-between items-center mb-5">
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-semibold text-blue-700">{name}</h2>
              <p className="text-xl text-gray-600">机场代码: {code}</p>
            </div>
            <div className="text-7xl">🌤️</div>
          </div>
          
          {/* 分隔线 */}
          <div className="w-full h-px bg-gray-200 my-4"></div>
          
          <div className="w-full flex justify-center mt-8 mb-8">
            <div className="text-2xl text-gray-500 flex items-center">
              <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-4"></div>
              加载中...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 transition-colors text-center cursor-pointer"
      >
        <div className="flex flex-col items-center">
          {/* 错误状态的顶部部分 */}
          <div className="w-full flex justify-between items-center mb-5">
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-semibold text-blue-700">{name}</h2>
              <p className="text-xl text-gray-600">机场代码: {code}</p>
            </div>
            <div className="text-7xl">🌤️</div>
          </div>
          
          {/* 分隔线 */}
          <div className="w-full h-px bg-gray-200 my-4"></div>
          
          <div className="w-full mt-8 mb-8 text-center">
            <p className="text-2xl text-red-500">{error || '天气数据不可用'}</p>
            <p className="mt-4 text-xl text-gray-500">点击查看天气</p>
          </div>
        </div>
      </a>
    );
  }

  // 获取日期标签
  const getDayLabel = (index: number, date: string) => {
    if (index === 0) return '今天';
    
    // 其他天显示标准时间格式
    const dayDate = new Date(date);
    return dayDate.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 获取当前小时的湿度数据
  const getCurrentHumidity = () => {
    if (!weather.relative_humidity_2m || weather.relative_humidity_2m.length === 0) {
      return 'N/A';
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // 找到最接近当前小时的湿度数据
    for (let i = 0; i < weather.time.length; i++) {
      const timeData = new Date(weather.time[i]);
      if (timeData.getHours() === currentHour) {
        return weather.relative_humidity_2m[i].toFixed(0);
      }
    }
    
    // 如果找不到精确匹配，返回第一个值
    return weather.relative_humidity_2m[0].toFixed(0);
  };

  // 最多显示3天预报
  const dailyForecasts = weather.daily_forecast.slice(0, 3);

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col w-full">
        {/* 顶部标题 */}
        <div className="w-full grid grid-cols-4 gap-5 mb-4">
          <div className="col-span-1">
            <h2 className="text-3xl font-semibold text-blue-700">{name}</h2>
            <p className="text-xl text-gray-600">机场代码: {code}</p>
          </div>
          
          {/* 天气图标显示在对应日期上方 */}
          {dailyForecasts.map((day, index) => {
            const weatherInfo = getWeatherDescription(day.weather_code);
            return (
              <div key={index} className="col-span-1 flex flex-col items-start">
                <div className="text-4xl mb-1">{weatherInfo.icon}</div>
                <div className="text-lg font-medium text-gray-800">{getDayLabel(index, day.date)}</div>
              </div>
            );
          })}
        </div>
        
        {/* 分隔线 */}
        <div className="w-full h-px bg-gray-200 my-4"></div>

        {/* 天气表格数据 */}
        <div className="w-full grid grid-cols-4 gap-5 mt-2">
          {/* 第一列 - 标签 */}
          <div className="col-span-1 flex flex-col space-y-5 text-xl text-gray-800">
            <span>天气状况</span>
            <span>当前温度</span> 
            <span>湿度</span>
            <span>风况</span>
            <span>温度范围</span>
          </div>

          {/* 天气数据列 */}
          {dailyForecasts.map((day, index) => {
            const weatherInfo = getWeatherDescription(day.weather_code);
            const windDirection = getWindDirection(day.wind_direction);
            return (
              <div key={index} className="col-span-1 flex flex-col space-y-5 text-xl text-gray-800">
                <span>{weatherInfo.text}</span>
                <span>{day.temperature_max.toFixed(1)}°C</span>
                <span>{index === 0 ? `${getCurrentHumidity()}%` : 'N/A'}</span>
                <span>{windDirection} {day.wind_speed_max.toFixed(1)} m/s</span>
                <span>{day.temperature_min.toFixed(1)}°C ~ {day.temperature_max.toFixed(1)}°C</span>
              </div>
            );
          })}
        </div>

        {/* 提示信息 */}
        <p className="mt-5 text-base text-blue-500 hover:underline text-center">
          点击查看详细天气
        </p>
      </div>
    </a>
  );
} 