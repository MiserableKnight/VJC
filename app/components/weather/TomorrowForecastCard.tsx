'use client';

import { useState, useEffect } from 'react';
import { 
  WeatherService,
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
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoading(true);
        setError(null);
        setErrorCode(null);
        console.log(`[TomorrowForecastCard] 开始获取明日天气数据: lat=${latitude}, lon=${longitude}`);
        
        const response = await WeatherService.fetchDailyWeatherData(latitude, longitude, 2); // 只获取今天和明天
        
        if (!response.success) {
          console.error(`[TomorrowForecastCard] 明日天气数据获取失败:`, response);
          setError(response.message || '无法加载明日天气数据');
          setErrorCode(response.code || 'ERROR');
          return;
        }
        
        setWeather(response);
        console.log('[TomorrowForecastCard] 成功获取明日天气数据');
      } catch (err) {
        console.error('[TomorrowForecastCard] 加载明日天气数据错误:', err);
        setError('无法连接天气服务');
        setErrorCode('NETWORK_ERROR');
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

  if (error || !weather || !weather.daily || weather.daily.time.length < 2) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-3">{title}</h3>
        <div className="w-full mt-4 mb-4 text-center">
          <p className="text-lg text-red-500">{error || '明日天气预测数据不可用'}</p>
          {errorCode && (
            <p className="text-sm text-gray-500 mt-2">
              {errorCode === 'TIMEOUT' ? '请求超时，请稍后再试' : 
               errorCode === 'NETWORK_ERROR' ? '请检查网络连接' : 
               '请稍后再试或联系管理员'}
            </p>
          )}
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
              setLoading(true);
              setError(null);
              setErrorCode(null);
              setTimeout(() => {
                WeatherService.fetchDailyWeatherData(latitude, longitude, 2)
                  .then(response => {
                    if (!response.success) {
                      setError(response.message || '无法加载明日天气数据');
                      setErrorCode(response.code || 'ERROR');
                      return;
                    }
                    setWeather(response);
                  })
                  .catch(err => {
                    setError('无法连接天气服务');
                    setErrorCode('NETWORK_ERROR');
                  })
                  .finally(() => setLoading(false));
              }, 500);
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 获取明天的天气数据（索引1）
  const tomorrowIndex = 1;
  const tomorrowDate = new Date(weather.daily.time[tomorrowIndex]);
  const tomorrowWeather = WeatherService.getWeatherDescription(weather.daily.weather_code[tomorrowIndex]);
  const tomorrowWindDirection = WeatherService.getWindDirection(weather.daily.wind_direction_10m_dominant[tomorrowIndex]);
  
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
              {weather.daily.temperature_2m_min[tomorrowIndex].toFixed(1)}°C ~ {weather.daily.temperature_2m_max[tomorrowIndex].toFixed(1)}°C
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
            <div className="text-lg text-blue-600 mb-1">💧 降水量</div>
            <div className="text-xl font-medium">
              {weather.daily.precipitation_sum[tomorrowIndex].toFixed(1)} mm
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-white rounded-md shadow-sm">
            <div className="text-lg text-blue-600 mb-1">💨 风况</div>
            <div className="text-xl font-medium">
              {tomorrowWindDirection}风 {weather.daily.wind_speed_10m_max[tomorrowIndex].toFixed(1)}m/s
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