import { BaseService, ApiResponse } from './baseService';
import { cache } from 'react';

// 技术状态类型定义
export interface SystemStatus {
  system: string;
  status: 'operational' | 'degraded' | 'non-operational';
  lastCheck: string;
  nextCheck: string;
  notes: string;
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  system: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface ComponentHealth {
  component: string;
  health: number; // 0-100
  status: 'good' | 'fair' | 'poor' | 'critical';
  estimatedRemainingLife: number; // 小时数
  lastReplaced: string;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  technician: string;
  findings: string;
  recommendations: string;
  components: {
    name: string;
    condition: string;
    actionRequired: boolean;
  }[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
}

export class TechnicalStatusService extends BaseService {
  /**
   * 获取飞机所有系统状态
   * @param registration 飞机注册号
   * @returns 系统状态列表
   */
  static fetchSystemStatus = cache(
    async (registration: string): Promise<ApiResponse<SystemStatus[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/technical/${registration}/systems`, { 
          next: { revalidate: 300 } // 5分钟缓存
        });
        
        if (!response.ok) {
          throw new Error(`系统状态API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取飞机组件健康状态
   * @param registration 飞机注册号
   * @param system 可选系统名称过滤
   * @returns 组件健康列表
   */
  static fetchComponentHealth = cache(
    async (registration: string, system?: string): Promise<ApiResponse<ComponentHealth[]>> => {
      return this.handleApiRequest(async () => {
        const url = system 
          ? `/api/technical/${registration}/components?system=${system}`
          : `/api/technical/${registration}/components`;
          
        const response = await fetch(url, { 
          next: { revalidate: 1800 } // 30分钟缓存
        });
        
        if (!response.ok) {
          throw new Error(`组件健康API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取系统警报
   * @param registration 飞机注册号
   * @param status 警报状态过滤: 'active' | 'resolved' | 'all'
   * @returns 系统警报列表
   */
  static fetchSystemAlerts = cache(
    async (registration: string, status: 'active' | 'resolved' | 'all' = 'active'): Promise<ApiResponse<SystemAlert[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/technical/${registration}/alerts?status=${status}`, { 
          next: { revalidate: 300 } // 5分钟缓存
        });
        
        if (!response.ok) {
          throw new Error(`系统警报API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 获取诊断报告
   * @param registration 飞机注册号
   * @param limit 限制返回记录数量
   * @returns 诊断报告列表
   */
  static fetchDiagnosticReports = cache(
    async (registration: string, limit: number = 10): Promise<ApiResponse<DiagnosticReport[]>> => {
      return this.handleApiRequest(async () => {
        const response = await fetch(`/api/technical/${registration}/diagnostic-reports?limit=${limit}`, { 
          next: { revalidate: 3600 } // 1小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`诊断报告API响应出错: ${response.status}`);
        }
        
        return await response.json();
      });
    }
  );

  /**
   * 确认系统警报
   * @param alertId 警报ID
   * @returns 操作结果
   */
  static async acknowledgeAlert(alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.handleApiRequest(async () => {
      const response = await fetch(`/api/technical/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`确认警报API响应出错: ${response.status}`);
      }
      
      return await response.json();
    });
  }

  /**
   * 解决系统警报
   * @param alertId 警报ID
   * @param notes 解决备注
   * @returns 操作结果
   */
  static async resolveAlert(alertId: string, notes: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.handleApiRequest(async () => {
      const response = await fetch(`/api/technical/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error(`解决警报API响应出错: ${response.status}`);
      }
      
      return await response.json();
    });
  }
} 