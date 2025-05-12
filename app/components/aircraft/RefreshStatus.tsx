import React from 'react';
import { REFRESH_TIME_CONFIG } from './hooks/useAircraftData';

interface RefreshStatusProps {
  lastUpdated: string;
  nextUpdateTime: string;
  refreshStatus: string;
  inRefreshPeriod: boolean;
}

export function RefreshStatus({ 
  lastUpdated, 
  nextUpdateTime, 
  refreshStatus, 
  inRefreshPeriod 
}: RefreshStatusProps) {
  return (
    <div className="text-right text-xs text-gray-500">
      <p>最后更新: {lastUpdated}</p>
      <p>下次更新: {nextUpdateTime}</p>
      <p>
        刷新状态: {refreshStatus} （刷新时段: 北京时间
        {REFRESH_TIME_CONFIG.START_HOUR}:{REFRESH_TIME_CONFIG.START_MINUTE}-
        {REFRESH_TIME_CONFIG.END_HOUR}:{REFRESH_TIME_CONFIG.END_MINUTE}，
        频率: 10分钟/次）
      </p>
      {!inRefreshPeriod && (
        <p className="text-orange-500 font-medium">
          当前不在数据刷新时段，显示的是上次获取的数据。
        </p>
      )}
    </div>
  );
} 