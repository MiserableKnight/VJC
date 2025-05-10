'use client';

import { useState, useEffect } from 'react';
import { 
  fetchWeatherData, 
  getWeatherDescription, 
  getWindDirection, 
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

  // 获取当前、未来1小时、未来3小时的索引
  const now = new Date();
  let currentIdx = 0;
  let plus1Idx = 0;
  let plus3Idx = 0;
  for (let i = 0; i < weather.time.length; i++) {
    const t = new Date(weather.time[i]);
    if (t > now) {
      currentIdx = i > 0 ? i - 1 : 0;
      plus1Idx = i;
      plus3Idx = i + 2 < weather.time.length ? i + 2 : weather.time.length - 1;
      break;
    }
  }

  const hourData = [currentIdx, plus1Idx, plus3Idx].map(idx => ({
    time: weather.time[idx],
    temperature: weather.temperature_2m[idx],
    humidity: weather.relative_humidity_2m[idx],
    windSpeed: weather.wind_speed_10m[idx],
    windDir: weather.wind_direction_10m[idx],
    weatherCode: weather.weather_code[idx],
  }));

  const getHourLabel = (idx: number) => {
    if (idx === 0) return '现在';
    if (idx === 1) return '1小时后';
    if (idx === 2) return '3小时后';
    return '';
  };

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-gray-200 rounded-lg p-6 hover:bg-blue-50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col w-full">
        {/* 顶部标题和天气图标 */}
        <div className="w-full grid grid-cols-4 gap-5 mb-4">
          <div className="col-span-1">
            <h2 className="text-3xl font-semibold text-blue-700">{name}</h2>
            <p className="text-xl text-gray-600">机场代码: {code}</p>
          </div>
          
          {/* 天气图标在顶部 */}
          {hourData.map((data, idx) => {
            const weatherInfo = getWeatherDescription(data.weatherCode);
            return (
              <div key={idx} className="col-span-1 text-center">
                <div className="text-6xl mb-1">{weatherInfo.icon}</div>
              </div>
            );
          })}
        </div>
        
        {/* 分隔线 */}
        <div className="w-full h-px bg-gray-200 my-4"></div>
        
        {/* 天气数据 */}
        <div className="w-full grid grid-cols-4 gap-5 mt-2">
          {/* 第一列 - 标签 */}
          <div className="col-span-1 flex flex-col space-y-5 text-xl text-gray-800">
            <span>时间</span>
            <span>天气状况</span>
            <span>温度</span>
            <span>湿度</span>
            <span>风况</span>
          </div>
          
          {/* 数据列 */}
          {hourData.map((data, idx) => {
            const weatherInfo = getWeatherDescription(data.weatherCode);
            const windDirection = getWindDirection(data.windDir);
            return (
              <div key={idx} className="col-span-1 flex flex-col space-y-5 text-xl text-gray-800 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium text-gray-800">{getHourLabel(idx)}</span>
                </div>
                <span>{weatherInfo.text}</span>
                <span>{data.temperature.toFixed(1)}°C</span>
                <span>{data.humidity ? `${data.humidity.toFixed(0)}%` : 'N/A'}</span>
                <span>{windDirection} {data.windSpeed.toFixed(1)} m/s</span>
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