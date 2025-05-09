'use client';

import { useState, useEffect } from 'react';
import { 
  fetchWeatherData, 
  getWeatherDescription, 
  getWindDirection, 
  getCurrentHourData,
  WeatherData
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

  // 获取当前小时的天气状况
  const currentWeatherCode = getCurrentHourData(weather.weather_code, weather.time);
  const weatherInfo = getWeatherDescription(currentWeatherCode);
  
  // 获取当前温度、湿度、风速和风向
  const currentTemp = getCurrentHourData(weather.temperature_2m, weather.time);
  const currentHumidity = getCurrentHourData(weather.relative_humidity_2m, weather.time);
  const currentWindSpeed = getCurrentHourData(weather.wind_speed_10m, weather.time);
  const currentWindDir = getCurrentHourData(weather.wind_direction_10m, weather.time);
  const windDirText = getWindDirection(currentWindDir);

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 transition-colors text-center cursor-pointer"
    >
      <div className="flex flex-col items-center">
        {/* 移动端水平布局的顶部部分 */}
        <div className="w-full flex justify-between items-center mb-5">
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-semibold text-blue-700">{name}</h2>
            <p className="text-xl text-gray-600">机场代码: {code}</p>
          </div>
          <div className="text-7xl">{weatherInfo.icon}</div>
        </div>
        
        {/* 分隔线 */}
        <div className="w-full h-px bg-gray-200 my-4"></div>
        
        {/* 主要天气信息部分 - 水平排列的指标 */}
        <div className="w-full grid grid-cols-1 gap-5 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-500">天气状况</span>
            <span className="text-2xl font-medium text-gray-800">{weatherInfo.text}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-500">当前温度</span>
            <span className="text-2xl font-medium text-gray-800">{currentTemp.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-500">湿度</span>
            <span className="text-2xl font-medium text-gray-800">{currentHumidity.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-500">风况</span>
            <span className="text-2xl font-medium text-gray-800">{windDirText}风 {currentWindSpeed.toFixed(1)}m/s</span>
          </div>
        </div>
        
        {/* 温度范围 */}
        <div className="w-full mt-5 flex items-center justify-between">
          <span className="text-xl text-gray-500">温度范围</span>
          <span className="text-2xl text-gray-800">{weather.temperature_2m_min.toFixed(1)}°C ~ {weather.temperature_2m_max.toFixed(1)}°C</span>
        </div>
        
        <p className="mt-5 text-base text-gray-500">点击查看详细天气</p>
      </div>
    </a>
  );
} 