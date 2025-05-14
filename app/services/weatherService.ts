import { cache } from 'react';
import { BaseService, ApiResponse } from './baseService';

// 更新接口，添加success、message和code字段
export interface WeatherData {
  hourly?: {
    temperature_2m: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    weather_code: number[];
    time: string[];
  };
  temperature_2m_max?: number;
  temperature_2m_min?: number;
  daily_forecast?: DailyForecast[];
  success: boolean;
  message?: string;
  code?: string;
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
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
  success: boolean;
  message?: string;
  code?: string;
}

export class WeatherService extends BaseService {
  /**
   * 获取天气数据
   * @param latitude 纬度
   * @param longitude 经度
   * @returns 天气数据
   */
  static async fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      // 使用本地API代理
      const url = `/api/weather?latitude=${latitude}&longitude=${longitude}`;
      console.log(`[WeatherService] 发送请求到: ${url}`);
      
      // 添加更长的超时时间和重试逻辑
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 增加到20秒超时
      
      let retries = 3;
      let response;
      let error;
      
      while (retries > 0) {
        try {
          response = await fetch(url, { 
            next: { revalidate: 3600 }, // 1小时缓存
            signal: controller.signal 
          });
          
          // 成功获取响应，跳出重试循环
          break;
        } catch (err) {
          error = err;
          retries--;
          console.log(`[WeatherService] 请求失败，剩余重试次数: ${retries}`);
          
          // 如果还有重试机会，等待1秒后重试
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      clearTimeout(timeoutId);
      
      // 如果所有重试都失败，返回错误响应
      if (!response) {
        console.error(`[WeatherService] 所有重试都失败:`, error);
        return {
          success: false,
          message: '网络连接错误，请稍后再试',
          code: 'NETWORK_ERROR'
        };
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '无法读取错误响应');
        console.error(`[WeatherService] 天气API响应出错: ${response.status} ${response.statusText}`, errorText);
        return {
          success: false,
          message: `天气API响应出错: ${response.status}`,
          code: 'API_ERROR'
        };
      }
      
      const data = await response.json().catch(err => {
        console.error('[WeatherService] 解析天气数据JSON失败:', err);
        return {
          success: false,
          message: '解析天气数据时出错',
          code: 'PARSE_ERROR'
        };
      });
      
      // 如果API已经返回了错误响应，直接返回
      if (data.success === false) {
        console.log('[WeatherService] API返回了错误响应:', data);
        return data;
      }
      
      console.log(`[WeatherService] 成功获取天气数据，hourly数据包含 ${data.hourly?.time?.length || 0} 个时间点`);
      
      if (!data.hourly || !data.hourly.temperature_2m || !data.hourly.time) {
        console.error('[WeatherService] 返回数据结构不完整:', data);
        return {
          success: false,
          message: '天气API返回的数据结构不完整',
          code: 'INCOMPLETE_DATA'
        };
      }
      
      // 计算最高和最低温度
      const temperatures = data.hourly.temperature_2m;
      const max = Math.max(...temperatures);
      const min = Math.min(...temperatures);
      
      // 处理每日预测数据
      const dailyForecast = this.processDailyForecast(data.hourly);
      
      // 构建标准化响应
      return {
        hourly: {
          temperature_2m: data.hourly.temperature_2m,
          wind_speed_10m: data.hourly.wind_speed_10m,
          wind_direction_10m: data.hourly.wind_direction_10m,
          relative_humidity_2m: data.hourly.relative_humidity_2m,
          precipitation: data.hourly.precipitation,
          weather_code: data.hourly.weather_code,
          time: data.hourly.time
        },
        temperature_2m_max: max,
        temperature_2m_min: min,
        daily_forecast: dailyForecast,
        success: true
      };
    } catch (error) {
      console.error('[WeatherService] 获取天气数据时出错:', error);
      
      // 增强错误信息
      let errorMessage = '获取天气数据失败';
      let errorCode = 'ERROR';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '获取天气数据超时，请稍后再试';
          errorCode = 'TIMEOUT';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        code: errorCode
      };
    }
  }

  /**
   * 获取每日天气预测数据
   * @param latitude 纬度
   * @param longitude 经度
   * @param days 天数
   * @returns 每日天气数据
   */
  static async fetchDailyWeatherData(latitude: number, longitude: number, days: number = 5): Promise<DailyWeatherData> {
    try {
      // 使用本地API代理
      const url = `/api/weather/daily?latitude=${latitude}&longitude=${longitude}&days=${days}`;
      console.log(`[WeatherService] 发送每日天气请求到: ${url}`);
      
      // 添加超时和重试逻辑
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时
      
      let retries = 3;
      let response;
      let error;
      
      while (retries > 0) {
        try {
          response = await fetch(url, { 
            next: { revalidate: 3600 }, // 1小时缓存
            signal: controller.signal 
          }); 
          
          // 成功获取响应，跳出重试循环
          break;
        } catch (err) {
          error = err;
          retries--;
          console.log(`[WeatherService] 每日天气请求失败，剩余重试次数: ${retries}`);
          
          // 如果还有重试机会，等待1秒后重试
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      clearTimeout(timeoutId);
      
      // 如果所有重试都失败，返回错误响应
      if (!response) {
        console.error(`[WeatherService] 所有每日天气请求重试都失败:`, error);
        return {
          success: false,
          message: '网络连接错误，请稍后再试',
          code: 'NETWORK_ERROR'
        };
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '无法读取错误响应');
        console.error(`[WeatherService] 每日天气API响应出错: ${response.status} ${response.statusText}`, errorText);
        return {
          success: false,
          message: `每日天气API响应出错: ${response.status}`,
          code: 'API_ERROR'
        };
      }
      
      const data = await response.json().catch(err => {
        console.error('[WeatherService] 解析每日天气数据JSON失败:', err);
        return {
          success: false,
          message: '解析每日天气数据时出错',
          code: 'PARSE_ERROR'
        };
      });
      
      // 如果API已经返回了错误响应，直接返回
      if (data.success === false) {
        console.log('[WeatherService] API返回了错误响应:', data);
        return data;
      }
      
      if (!data.daily || !data.daily.time) {
        console.error('[WeatherService] 每日天气数据结构不完整:', data);
        return {
          success: false,
          message: '每日天气API返回的数据结构不完整',
          code: 'INCOMPLETE_DATA'
        };
      }
      
      console.log(`[WeatherService] 成功获取每日天气数据, 包含 ${data.daily.time.length} 天`);
      
      return {
        daily: {
          time: data.daily.time,
          temperature_2m_max: data.daily.temperature_2m_max,
          temperature_2m_min: data.daily.temperature_2m_min,
          precipitation_sum: data.daily.precipitation_sum,
          weather_code: data.daily.weather_code,
          wind_speed_10m_max: data.daily.wind_speed_10m_max,
          wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant
        },
        success: true
      };
    } catch (error) {
      console.error('[WeatherService] 获取每日天气数据时出错:', error);
      
      // 增强错误信息
      let errorMessage = '获取每日天气数据失败';
      let errorCode = 'ERROR';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '获取每日天气数据超时，请稍后再试';
          errorCode = 'TIMEOUT';
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        code: errorCode
      };
    }
  }

  /**
   * 处理每日预测数据
   * @param hourlyData 小时数据
   * @returns 每日预测
   */
  private static processDailyForecast(hourlyData: any): DailyForecast[] {
    try {
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
    } catch (error) {
      console.error('[WeatherService] 处理每日预测数据出错:', error);
      return []; // 返回空数组而不是让整个应用崩溃
    }
  }

  /**
   * 将天气代码转换为可读文本和图标
   * @param code 天气代码
   * @returns 天气描述和图标
   */
  static getWeatherDescription(code: number): { text: string; icon: string } {
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

  /**
   * 获取风向文字
   * @param degree 角度
   * @returns 风向文字
   */
  static getWindDirection(degree: number): string {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  }
} 