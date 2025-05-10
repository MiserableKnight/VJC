'use client';

import { useState, useEffect } from 'react';
import { 
  fetchDailyWeatherData, 
  getWeatherDescription, 
  getWindDirection, 
  DailyWeatherData 
} from '../../services/weatherService';

interface DailyForecastCardProps {
  latitude: number;
  longitude: number;
  days?: number;
  title?: string;
}

export function DailyForecastCard({ 
  latitude, 
  longitude, 
  days = 5,
  title = "未来天气预测"
}: DailyForecastCardProps) {
  const [weather, setWeather] = useState<DailyWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoading(true);
        const data = await fetchDailyWeatherData(latitude, longitude, days);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('无法加载天气预测数据');
        console.error('Error loading daily weather data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeatherData();
  }, [latitude, longitude, days]);

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

  if (error || !weather) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
        <div className="w-full mt-4 mb-4 text-center">
          <p className="text-lg text-red-500">{error || '天气预测数据不可用'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {weather.time.map((date, index) => {
          const dayWeather = getWeatherDescription(weather.weather_code[index]);
          const windDirection = getWindDirection(weather.wind_direction_10m_dominant[index]);
          const dayDate = new Date(date);
          const formattedDate = dayDate.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          });
          
          return (
            <div key={index} className="p-3 border rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="text-md font-medium">{formattedDate}</div>
              <div className="text-3xl my-2">{dayWeather.icon}</div>
              <div className="text-sm font-medium">{dayWeather.text}</div>
              <div className="text-sm mt-2 flex justify-between">
                <span>🌡️</span>
                <span>{weather.temperature_2m_min[index].toFixed(1)}°C ~ {weather.temperature_2m_max[index].toFixed(1)}°C</span>
              </div>
              <div className="text-sm mt-1 flex justify-between">
                <span>💧</span>
                <span>{weather.precipitation_sum[index].toFixed(1)} mm</span>
              </div>
              <div className="text-sm mt-1 flex justify-between">
                <span>💨</span>
                <span>{windDirection}风 {weather.wind_speed_10m_max[index].toFixed(1)}m/s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 