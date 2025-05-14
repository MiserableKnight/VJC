import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

// 飞机相关类型定义
export interface Aircraft {
  registration: string;
  type: string;
  model: string;
  serialNumber: string;
  age: number;
  deliveryDate: string;
  status: 'active' | 'maintenance' | 'standby' | 'retired';
  lastMaintenance: string;
  nextMaintenance: string;
  homeBase: string;
}

export interface AircraftDetails extends Aircraft {
  utilization: {
    hoursFlown: number;
    cyclesCompleted: number;
    flightsToday: number;
    flightsThisWeek: number;
    flightsThisMonth: number;
  };
  performance: {
    availabilityRate: number;
    dispatchReliability: number;
    delayRate: number;
    fuelEfficiency: number;
  };
}

export interface MaintenanceRecord {
  id: string;
  aircraftRegistration: string;
  type: 'scheduled' | 'unscheduled';
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  technicians: string[];
  parts: string[];
  cost: number;
}

export class AircraftService extends BaseService {
  /**
   * 获取所有飞机列表
   * @returns 飞机列表
   */
  static fetchAllAircraft = cache(
    async (): Promise<ApiResponse<Aircraft[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch('/api/aircraft', { 
          next: { revalidate: 3600 } // 1小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`飞机API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取飞机详情
   * @param registration 飞机注册号
   * @returns 飞机详细信息
   */
  static fetchAircraftDetails = cache(
    async (registration: string): Promise<ApiResponse<AircraftDetails>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/aircraft/${registration}`, { 
          next: { revalidate: 1800 } // 30分钟缓存
        });
        
        if (!response.ok) {
          throw new Error(`飞机详情API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取飞机维护记录
   * @param registration 飞机注册号
   * @param limit 限制返回记录数量
   * @returns 维护记录列表
   */
  static fetchMaintenanceRecords = cache(
    async (registration: string, limit: number = 10): Promise<ApiResponse<MaintenanceRecord[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/aircraft/${registration}/maintenance?limit=${limit}`, { 
          next: { revalidate: 7200 } // 2小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`维护记录API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 更新飞机状态
   * @param registration 飞机注册号
   * @param status 新状态
   * @returns 更新结果
   */
  static async updateAircraftStatus(
    registration: string, 
    status: Aircraft['status']
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.handleApiRequest(async () => {
      const response = await fetch(`/api/aircraft/${registration}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`更新飞机状态API响应出错: ${response.status}`);
      }
      
      return await response.json();
    });
  }
} 