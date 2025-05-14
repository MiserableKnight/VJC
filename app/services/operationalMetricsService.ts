import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

// 运营指标类型定义
export interface OperationalMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface FleetUtilization {
  date: string;
  totalAircraft: number;
  activeAircraft: number;
  utilizationRate: number; // 百分比
  totalFlightHours: number;
  averageHoursPerAircraft: number;
  maintenanceDowntime: number; // 小时
}

export interface RoutePerformance {
  routeCode: string;
  fromAirport: string;
  toAirport: string;
  loadFactor: number; // 百分比
  onTimePerformance: number; // 百分比
  averageDelay: number; // 分钟
  cancellationRate: number; // 百分比
  revenuePerFlight: number;
  profitMargin: number; // 百分比
  passengerSatisfaction: number; // 1-5分
}

export interface OperationalEfficiency {
  metric: string;
  current: number;
  previousPeriod: number;
  yearToDate: number;
  industry: number;
  target: number;
  unit: string;
}

export class OperationalMetricsService extends BaseService {
  /**
   * 获取关键运营指标
   * @returns 关键运营指标列表
   */
  static fetchKeyMetrics = cache(
    async (): Promise<ApiResponse<OperationalMetric[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch('/api/operational/key-metrics', { 
          next: { revalidate: 3600 } // 1小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`关键指标API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取机队利用率数据
   * @param period 时间周期: 'daily' | 'weekly' | 'monthly'
   * @param limit 限制返回记录数量
   * @returns 机队利用率数据
   */
  static fetchFleetUtilization = cache(
    async (period: 'daily' | 'weekly' | 'monthly', limit: number = 10): Promise<ApiResponse<FleetUtilization[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/operational/fleet-utilization?period=${period}&limit=${limit}`, { 
          next: { revalidate: 7200 } // 2小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`机队利用率API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取航线表现数据
   * @param sortBy 排序字段
   * @param limit 限制返回记录数量
   * @returns 航线表现数据
   */
  static fetchRoutePerformance = cache(
    async (sortBy: keyof RoutePerformance = 'profitMargin', limit: number = 20): Promise<ApiResponse<RoutePerformance[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/operational/route-performance?sortBy=${sortBy}&limit=${limit}`, { 
          next: { revalidate: 14400 } // 4小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`航线表现API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取特定航线的表现数据
   * @param routeCode 航线代码，例如 'SGN-HAN'
   * @returns 特定航线表现数据
   */
  static fetchRouteDetails = cache(
    async (routeCode: string): Promise<ApiResponse<RoutePerformance>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/operational/route-performance/${routeCode}`, { 
          next: { revalidate: 7200 } // 2小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`航线详情API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取运营效率指标
   * @returns 运营效率指标
   */
  static fetchOperationalEfficiency = cache(
    async (): Promise<ApiResponse<OperationalEfficiency[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch('/api/operational/efficiency', { 
          next: { revalidate: 14400 } // 4小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`运营效率API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取飞机特定的运营指标
   * @param registration 飞机注册号
   * @returns 飞机运营指标
   */
  static fetchAircraftMetrics = cache(
    async (registration: string): Promise<ApiResponse<OperationalMetric[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/operational/aircraft/${registration}/metrics`, { 
          next: { revalidate: 3600 } // 1小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`飞机指标API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );
} 