import { cache } from 'react';

export interface WeatherData {
  temperature_2m: number[];
  temperature_2m_max: number;
  temperature_2m_min: number;
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  weather_code: number[];
  time: string[];
  daily_forecast: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  weather_code: number;
  precipitation_sum: number;
  wind_speed_max: number;
  wind_direction: number;
}

export interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weather_code: number[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

// 使用React的cache功能来缓存API响应
export const fetchWeatherData = cache(
  async (latitude: number, longitude: number): Promise<WeatherData> => {
    try {
      // 使用本地API代理
      const url = `/api/weather?latitude=${latitude}&longitude=${longitude}`;
      
      const response = await fetch(url, { next: { revalidate: 3600 } }); // 1小时缓存
      
      if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 计算最高和最低温度
      const temperatures = data.hourly.temperature_2m;
      const max = Math.max(...temperatures);
      const min = Math.min(...temperatures);
      
      // 处理每日预测数据
      const dailyForecast = processDailyForecast(data.hourly);
      
      return {
        temperature_2m: data.hourly.temperature_2m,
        temperature_2m_max: max,
        temperature_2m_min: min,
        wind_speed_10m: data.hourly.wind_speed_10m,
        wind_direction_10m: data.hourly.wind_direction_10m,
        relative_humidity_2m: data.hourly.relative_humidity_2m,
        precipitation: data.hourly.precipitation,
        weather_code: data.hourly.weather_code,
        time: data.hourly.time,
        daily_forecast: dailyForecast
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
);

// 获取每日天气预测数据
export const fetchDailyWeatherData = cache(
  async (latitude: number, longitude: number, days: number = 5): Promise<DailyWeatherData> => {
    try {
      // 使用本地API代理
      const url = `/api/weather/daily?latitude=${latitude}&longitude=${longitude}&days=${days}`;
      
      const response = await fetch(url, { next: { revalidate: 3600 } }); // 1小时缓存
      
      if (!response.ok) {
        throw new Error(`Daily Weather API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        time: data.daily.time,
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
        precipitation_sum: data.daily.precipitation_sum,
        weather_code: data.daily.weather_code,
        wind_speed_10m_max: data.daily.wind_speed_10m_max,
        wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant
      };
    } catch (error) {
      console.error('Error fetching daily weather data:', error);
      throw error;
    }
  }
);

// 处理每日预测数据
function processDailyForecast(hourlyData: any): DailyForecast[] {
  const dailyForecast: DailyForecast[] = [];
  const daysMap = new Map<string, {
    temps: number[],
    weatherCodes: number[],
    precipitation: number[],
    windSpeeds: number[],
    windDirections: number[]
  }>();
  
  // 将小时数据按日期分组
  hourlyData.time.forEach((time: string, index: number) => {
    const date = time.split('T')[0];
    if (!daysMap.has(date)) {
      daysMap.set(date, {
        temps: [],
        weatherCodes: [],
        precipitation: [],
        windSpeeds: [],
        windDirections: []
      });
    }
    
    const dayData = daysMap.get(date)!;
    dayData.temps.push(hourlyData.temperature_2m[index]);
    dayData.weatherCodes.push(hourlyData.weather_code[index]);
    dayData.precipitation.push(hourlyData.precipitation[index]);
    dayData.windSpeeds.push(hourlyData.wind_speed_10m[index]);
    dayData.windDirections.push(hourlyData.wind_direction_10m[index]);
  });
  
  // 处理每日数据
  daysMap.forEach((data, date) => {
    // 获取当天最常见的天气代码
    const weatherCodeCounts = data.weatherCodes.reduce((acc: {[key: number]: number}, code: number) => {
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonWeatherCode = parseInt(
      Object.keys(weatherCodeCounts).reduce((a, b) => 
        weatherCodeCounts[parseInt(a)] > weatherCodeCounts[parseInt(b)] ? a : b
      )
    );
    
    // 计算风向平均值
    const avgWindDirection = Math.round(
      data.windDirections.reduce((sum, dir) => sum + dir, 0) / data.windDirections.length
    );
    
    dailyForecast.push({
      date,
      temperature_max: Math.max(...data.temps),
      temperature_min: Math.min(...data.temps),
      weather_code: mostCommonWeatherCode,
      precipitation_sum: data.precipitation.reduce((sum, val) => sum + val, 0),
      wind_speed_max: Math.max(...data.windSpeeds),
      wind_direction: avgWindDirection
    });
  });
  
  // 按日期排序
  return dailyForecast.sort((a, b) => a.date.localeCompare(b.date));
}

// 将天气代码转换为可读文本和图标
export function getWeatherDescription(code: number): { text: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  switch (true) {
    case code === 0:
      return { text: '晴朗', icon: '☀️' };
    case code === 1:
      return { text: '大部晴朗', icon: '🌤️' };
    case code >= 2 && code <= 3:
      return { text: '多云', icon: '⛅' };
    case code === 45 || code === 48:
      return { text: '雾', icon: '🌫️' };
    case code >= 51 && code <= 55:
      return { text: '小雨', icon: '🌦️' };
    case code >= 56 && code <= 57:
      return { text: '冻雨', icon: '🌨️' };
    case code >= 61 && code <= 65:
      return { text: '雨', icon: '🌧️' };
    case code >= 66 && code <= 67:
      return { text: '冻雨', icon: '🌨️' };
    case code >= 71 && code <= 77:
      return { text: '雪', icon: '❄️' };
    case code >= 80 && code <= 82:
      return { text: '阵雨', icon: '🌧️' };
    case code >= 85 && code <= 86:
      return { text: '阵雪', icon: '🌨️' };
    case code === 95:
      return { text: '雷暴', icon: '⛈️' };
    case code >= 96 && code <= 99:
      return { text: '雷暴伴有冰雹', icon: '⛈️' };
    default:
      return { text: '未知', icon: '❓' };
  }
}

// 获取风向文字
export function getWindDirection(degree: number): string {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

// 从数组获取当前小时的数据
export function getCurrentHourData(data: number[], times: string[]): number {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 查找最接近当前小时的时间索引
  for (let i = 0; i < times.length; i++) {
    const time = new Date(times[i]);
    if (time.getHours() === currentHour) {
      return data[i];
    }
  }
  
  // 如果找不到精确匹配，返回第一个值
  return data[0];
} 