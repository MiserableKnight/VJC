import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

export interface AircraftFlightRadarInfo {
  registration: string;
  flightRadarUrl: string;
}

// 飞行历史接口
export interface FlightHistoryItem {
  id: string;
  date: string;
  fromAirport: string;
  fromCode: string;
  toAirport: string;
  toCode: string;
  flightNumber: string;
  flightTime: string;
  scheduledDeparture: string;
  actualDeparture: string;
  scheduledArrival: string;
  status: string;
}

export class FlightRadarService extends BaseService {
  /**
   * 生成FlightRadar24的URL
   * @param registration 飞机注册号
   * @returns FlightRadar24的URL
   */
  static getFlightRadarUrl(registration: string): string {
    // 确保注册号格式正确，移除可能的空格并转为小写
    const formattedReg = registration.trim().toLowerCase();
    return `https://www.flightradar24.com/data/aircraft/${formattedReg}`;
  }
  
  /**
   * 获取飞机FlightRadar信息
   * @param registration 飞机注册号
   * @returns 飞机FlightRadar信息
   */
  static getAircraftFlightRadarInfo(registration: string): AircraftFlightRadarInfo {
    return {
      registration: registration,
      flightRadarUrl: this.getFlightRadarUrl(registration)
    };
  }
  
  /**
   * 批量获取多架飞机的FlightRadar信息
   * @param registrations 飞机注册号数组
   * @returns 飞机FlightRadar信息数组
   */
  static getMultipleAircraftFlightRadarInfo(registrations: string[]): AircraftFlightRadarInfo[] {
    return registrations.map(registration => this.getAircraftFlightRadarInfo(registration));
  }
  
  /**
   * 获取FlightRadar链接的缓存版本
   */
  static fetchFlightRadarInfo = cache(
    async (registration: string): Promise<ApiResponse<AircraftFlightRadarInfo>> => {
      return this.handleApiRequest(async () => {
        return this.getAircraftFlightRadarInfo(registration);
      });
    }
  );

  /**
   * 获取飞行历史数据
   * 注意：目前返回模拟数据，实际实现应从API获取
   * @param registration 飞机注册号
   * @returns 飞行历史数据
   */
  static async fetchFlightHistory(registration: string): Promise<FlightHistoryItem[]> {
    console.log(`尝试获取飞机 ${registration} 的飞行历史数据`);
    
    try {
      // 这里应有实际API调用，目前使用备用数据
      return this.getFallbackFlightData(registration);
    } catch (error) {
      console.error(`获取飞行历史数据失败:`, error);
      return this.getFallbackFlightData(registration);
    }
  }

  /**
   * 获取备用的飞行历史数据
   * @param registration 飞机注册号
   * @returns 模拟的飞行历史数据
   */
  static getFallbackFlightData(registration: string): FlightHistoryItem[] {
    console.log(`使用模拟数据作为 ${registration} 的飞行历史`);
    
    // 获取当前日期，格式化为DD MMM YYYY
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    
    // 昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    
    // 根据飞机注册号生成一些模拟数据
    return [
      {
        id: '1',
        date: formattedDate,
        fromAirport: 'Con Dao',
        fromCode: 'VCS',
        toAirport: 'Hanoi',
        toCode: 'HAN',
        flightNumber: `VJ${100 + (registration.charCodeAt(4) % 10)}`,
        flightTime: '2:03',
        scheduledDeparture: '04:35',
        actualDeparture: '05:08',
        scheduledArrival: '06:50',
        status: 'Landed 07:12'
      },
      {
        id: '2',
        date: formattedDate,
        fromAirport: 'Ho Chi Minh City',
        fromCode: 'SGN',
        toAirport: 'Con Dao',
        toCode: 'VCS',
        flightNumber: `VJ${110 + (registration.charCodeAt(4) % 10)}`,
        flightTime: '0:40',
        scheduledDeparture: '03:30',
        actualDeparture: '03:58',
        scheduledArrival: '04:10',
        status: 'Landed 04:38'
      },
      {
        id: '3',
        date: formattedYesterday,
        fromAirport: 'Hanoi',
        fromCode: 'HAN',
        toAirport: 'Con Dao',
        toCode: 'VCS',
        flightNumber: `VJ${101 + (registration.charCodeAt(4) % 10)}`,
        flightTime: '2:00',
        scheduledDeparture: '23:45',
        actualDeparture: '23:55',
        scheduledArrival: '01:55',
        status: 'Landed 01:55'
      }
    ];
  }
} 