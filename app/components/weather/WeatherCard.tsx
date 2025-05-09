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
          <div className="text-4xl mb-4">🌤️</div>
          <h2 className="text-xl font-semibold text-blue-700">{name}</h2>
          <p className="mt-2 text-gray-600">机场代码: {code}</p>
          <div className="mt-4 text-gray-500">加载中...</div>
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
          <div className="text-4xl mb-4">🌤️</div>
          <h2 className="text-xl font-semibold text-blue-700">{name}</h2>
          <p className="mt-2 text-gray-600">机场代码: {code}</p>
          <p className="mt-4 text-sm text-red-500">{error || '天气数据不可用'}</p>
          <p className="mt-2 text-sm text-gray-500">点击查看天气</p>
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
        <div className="text-4xl mb-4">{weatherInfo.icon}</div>
        <h2 className="text-xl font-semibold text-blue-700">{name}</h2>
        <p className="mt-1 text-gray-600">机场代码: {code}</p>
        
        <div className="mt-4 space-y-2 text-left w-full">
          <p className="text-md text-gray-800">
            <span className="font-medium">{weatherInfo.text}</span> {currentTemp.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600">
            🌡️ 温度: {weather.temperature_2m_min.toFixed(1)}°C ~ {weather.temperature_2m_max.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600">
            💧 湿度: {currentHumidity.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600">
            💨 风: {windDirText}风 {currentWindSpeed.toFixed(1)}m/s
          </p>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">点击查看详细天气</p>
      </div>
    </a>
  );
} 