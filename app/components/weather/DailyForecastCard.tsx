'use client';

import { useState, useEffect } from 'react';
import { 
  WeatherService, 
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
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoading(true);
        setError(null);
        setErrorCode(null);
        console.log(`[DailyForecastCard] 开始获取天气预测数据: lat=${latitude}, lon=${longitude}, days=${days}`);
        
        const response = await WeatherService.fetchDailyWeatherData(latitude, longitude, days);
        
        if (!response.success) {
          console.error(`[DailyForecastCard] 天气预测数据获取失败:`, response);
          setError(response.message || '无法加载天气预测数据');
          setErrorCode(response.code || 'ERROR');
          return;
        }
        
        setWeather(response);
        console.log(`[DailyForecastCard] 天气预测数据获取成功`);
      } catch (err) {
        console.error(`[DailyForecastCard] 天气预测数据获取错误:`, err);
        setError('无法连接天气服务');
        setErrorCode('NETWORK_ERROR');
      } finally {
        setLoading(false);
      }
    }

    loadWeatherData();
  }, [latitude, longitude, days]);

  if (loading) {
    return (
      <div className="daily-forecast-card loading">
        <h3 className="card-title">{title}</h3>
        <div className="card-content">
          <p className="loading-text">加载天气预测数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-forecast-card error">
        <h3 className="card-title">{title}</h3>
        <div className="card-content">
          <p className="error-message">{error}</p>
          <p className="error-code">{errorCode === 'TIMEOUT' ? '请求超时，请稍后再试' : 
               errorCode === 'NETWORK_ERROR' ? '请检查网络连接' : 
               '请稍后再试或联系管理员'}</p>
          <button 
            className="retry-button" 
            onClick={() => {
              setLoading(true);
              setError(null);
              setErrorCode(null);
              setTimeout(() => {
                WeatherService.fetchDailyWeatherData(latitude, longitude, days)
                  .then(response => {
                    if (!response.success) {
                      setError(response.message || '无法加载天气预测数据');
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

  if (!weather || !weather.daily) {
    return (
      <div className="daily-forecast-card error">
        <h3 className="card-title">{title}</h3>
        <div className="card-content">
          <p className="error-message">天气预测数据格式错误</p>
          <button 
            className="retry-button" 
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                WeatherService.fetchDailyWeatherData(latitude, longitude, days)
                  .then(response => {
                    if (!response.success) {
                      setError(response.message || '无法加载天气预测数据');
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

  // 天气代码转换为描述和图标
  const getWeatherDescription = (code: number) => {
    // 简单的天气代码映射，与WeatherCard一致
    const weatherCodes: Record<number, { description: string, icon: string }> = {
      0: { description: '晴朗', icon: '☀️' },
      1: { description: '晴间多云', icon: '🌤️' },
      2: { description: '多云', icon: '⛅' },
      3: { description: '阴天', icon: '☁️' },
      45: { description: '雾', icon: '🌫️' },
      48: { description: '霾', icon: '🌫️' },
      51: { description: '小毛毛雨', icon: '🌦️' },
      53: { description: '毛毛雨', icon: '🌦️' },
      55: { description: '大毛毛雨', icon: '🌧️' },
      56: { description: '冻毛毛雨', icon: '🌧️' },
      57: { description: '强冻毛毛雨', icon: '🌧️' },
      61: { description: '小雨', icon: '🌧️' },
      63: { description: '中雨', icon: '🌧️' },
      65: { description: '大雨', icon: '🌧️' },
      66: { description: '冻雨', icon: '🌧️' },
      67: { description: '强冻雨', icon: '🌧️' },
      71: { description: '小雪', icon: '🌨️' },
      73: { description: '中雪', icon: '🌨️' },
      75: { description: '大雪', icon: '🌨️' },
      77: { description: '雪粒', icon: '🌨️' },
      80: { description: '小阵雨', icon: '🌦️' },
      81: { description: '中阵雨', icon: '🌦️' },
      82: { description: '强阵雨', icon: '⛈️' },
      85: { description: '小阵雪', icon: '🌨️' },
      86: { description: '大阵雪', icon: '🌨️' },
      95: { description: '雷暴', icon: '⛈️' },
      96: { description: '雷暴伴有小冰雹', icon: '⛈️' },
      99: { description: '雷暴伴有大冰雹', icon: '⛈️' },
    };
    
    return weatherCodes[code] || { description: '未知', icon: '❓' };
  };

  // 获取日期格式化
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  return (
    <div className="daily-forecast-card">
      <h3 className="card-title">{title}</h3>
      <div className="forecast-list">
        {weather.daily.time.map((time, index) => {
          const weatherInfo = getWeatherDescription(weather.daily.weather_code[index]);
          return (
            <div key={time} className="forecast-day">
              <div className="forecast-date">{formatDate(time)}</div>
              <div className="forecast-icon">{weatherInfo.icon}</div>
              <div className="forecast-desc">{weatherInfo.description}</div>
              <div className="forecast-temp">
                <span className="max-temp">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                <span className="min-temp">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 