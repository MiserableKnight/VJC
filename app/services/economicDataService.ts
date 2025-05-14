import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

// 经济数据类型定义
export interface FuelPrice {
  date: string;
  pricePerGallon: number;
  pricePerLiter: number;
  currency: string;
  location: string;
  change: number; // 相对前一天的变化百分比
}

export interface RevenueForecast {
  period: string; // 月份或季度
  total: number;
  domestic: number;
  international: number;
  growth: number; // 同比增长
  currency: string;
}

export interface OperatingCost {
  category: string; // 如 'fuel', 'maintenance', 'crew', 'airport', 等
  amount: number;
  period: string; // 'monthly', 'quarterly', 'yearly'
  percentage: number; // 占总成本百分比
  change: number; // 同比变化
  currency: string;
}

export interface MarketData {
  date: string;
  passengerDemand: number; // 百万人次
  capacityOffered: number; // 百万座位公里
  loadFactor: number; // 百分比
  yieldPerKm: number;
  marketShare: number; // 百分比
  competitorComparison: {
    [competitor: string]: {
      loadFactor: number;
      marketShare: number;
      priceIndex: number; // 相对指数，我们 = 100
    };
  };
}

export class EconomicDataService extends BaseService {
  /**
   * 获取最新燃油价格数据
   * @returns 燃油价格数据
   */
  static fetchFuelPrices = cache(
    async (): Promise<ApiResponse<FuelPrice[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch('/api/economic/fuel-prices', { 
          next: { revalidate: 86400 } // 24小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`燃油价格API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取收入预测
   * @param period 时间周期类型: 'monthly' | 'quarterly' | 'yearly'
   * @returns 收入预测数据
   */
  static fetchRevenueForecast = cache(
    async (period: 'monthly' | 'quarterly' | 'yearly'): Promise<ApiResponse<RevenueForecast[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/economic/revenue-forecast?period=${period}`, { 
          next: { revalidate: 86400 } // 24小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`收入预测API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取运营成本明细
   * @param period 时间周期类型: 'monthly' | 'quarterly' | 'yearly'
   * @returns 运营成本数据
   */
  static fetchOperatingCosts = cache(
    async (period: 'monthly' | 'quarterly' | 'yearly'): Promise<ApiResponse<OperatingCost[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/economic/operating-costs?period=${period}`, { 
          next: { revalidate: 86400 } // 24小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`运营成本API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取市场数据
   * @param timeRange 时间范围: 'week' | 'month' | 'quarter' | 'year'
   * @returns 市场数据
   */
  static fetchMarketData = cache(
    async (timeRange: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<MarketData[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/economic/market-data?range=${timeRange}`, { 
          next: { revalidate: 43200 } // 12小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`市场数据API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取航线盈利能力分析
   * @param routeCode 航线代码，例如 'SGN-HAN'
   * @returns 航线盈利能力数据
   */
  static fetchRouteProfitability = cache(
    async (routeCode: string): Promise<ApiResponse<any>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/economic/route-profitability/${routeCode}`, { 
          next: { revalidate: 86400 } // 24小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`航线盈利能力API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );
} 