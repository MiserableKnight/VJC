'use client';

import { useState, useEffect } from 'react';
import { 
  fetchDailyWeatherData, 
  getWeatherDescription, 
  getWindDirection, 
  DailyWeatherData 
} from '../../services/weatherService';

interface TomorrowForecastCardProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export function TomorrowForecastCard({ 
  latitude, 
  longitude, 
  title = "明日天气预测"
}: TomorrowForecastCardProps) {
  const [weather, setWeather] = useState<DailyWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoading(true);
        const data = await fetchDailyWeatherData(latitude, longitude, 2); // 只获取今天和明天
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('无法加载明日天气预测数据');
        console.error('Error loading tomorrow weather data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeatherData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
        <div className="w-full flex justify-center mt-4 mb-4">
          <div className="text-lg text-gray-500 flex items-center">
            <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-3"></div>
            加载中...
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather || weather.time.length < 2) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
        <div className="w-full mt-4 mb-4 text-center">
          <p className="text-lg text-red-500">{error || '明日天气预测数据不可用'}</p>
        </div>
      </div>
    );
  }

  // 获取明天的天气数据（索引1）
  const tomorrowIndex = 1;
  const tomorrowDate = new Date(weather.time[tomorrowIndex]);
  const tomorrowWeather = getWeatherDescription(weather.weather_code[tomorrowIndex]);
  const tomorrowWindDirection = getWindDirection(weather.wind_direction_10m_dominant[tomorrowIndex]);
  
  const formattedDate = tomorrowDate.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-col items-center p-4 border rounded-md bg-blue-50">
        <div className="text-lg font-medium text-blue-800 mb-2">{formattedDate}</div>
        <div className="text-6xl my-3">{tomorrowWeather.icon}</div>
        <div className="text-xl font-medium text-gray-800 mb-3">{tomorrowWeather.text}</div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
            <div className="text-lg text-blue-600 mb-1">🌡️ 温度范围</div>
            <div className="text-xl font-medium">
              {weather.temperature_2m_min[tomorrowIndex].toFixed(1)}°C ~ {weather.temperature_2m_max[tomorrowIndex].toFixed(1)}°C
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
            <div className="text-lg text-blue-600 mb-1">💧 降水量</div>
            <div className="text-xl font-medium">
              {weather.precipitation_sum[tomorrowIndex].toFixed(1)} mm
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
            <div className="text-lg text-blue-600 mb-1">💨 风况</div>
            <div className="text-xl font-medium">
              {tomorrowWindDirection}风 {weather.wind_speed_10m_max[tomorrowIndex].toFixed(1)}m/s
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          数据更新时间: {new Date().toLocaleString('zh-CN')}
        </div>
      </div>
    </div>
  );
} 