import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

export interface AircraftFlightRadarInfo {
  registration: string;
  flightRadarUrl: string;
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
} 