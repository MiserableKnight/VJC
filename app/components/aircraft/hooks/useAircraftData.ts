import { useState, useEffect } from 'react';
import { AircraftInfo } from '../../../services/opensky';

// 数据刷新间隔（10分钟 = 600,000毫秒）
export const DATA_REFRESH_INTERVAL = 600000;

// 北京时间刷新时段设置
export const REFRESH_TIME_CONFIG = {
  START_HOUR: 7,    // 早上7点
  START_MINUTE: 45, // 45分
  END_HOUR: 22,     // 晚上10点
  END_MINUTE: 0,    // 0分
};

export interface AircraftData {
  B652G: AircraftInfo | null;
  B656E: AircraftInfo | null;
}

export interface AircraftDataState {
  aircraftData: AircraftData;
  loading: boolean;
  error: string | null;
  lastUpdated: string;
  nextUpdateTime: string;
  refreshStatus: string;
  inRefreshPeriod: boolean;
}

export function useAircraftData() {
  const [state, setState] = useState<AircraftDataState>({
    aircraftData: { B652G: null, B656E: null },
    loading: true,
    error: null,
    lastUpdated: new Date().toLocaleTimeString(),
    nextUpdateTime: '',
    refreshStatus: '等待中',
    inRefreshPeriod: false,
  });

  // 检查当前是否在刷新时段内
  function isWithinRefreshPeriod(): boolean {
    const now = new Date();
    
    // 获取北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
    const hours = beijingTime.getUTCHours();
    const minutes = beijingTime.getUTCMinutes();
    
    // 转换为分钟表示，方便比较
    const currentMinutes = hours * 60 + minutes;
    const startMinutes = REFRESH_TIME_CONFIG.START_HOUR * 60 + REFRESH_TIME_CONFIG.START_MINUTE;
    const endMinutes = REFRESH_TIME_CONFIG.END_HOUR * 60 + REFRESH_TIME_CONFIG.END_MINUTE;
    
    const result = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    
    setState(prev => ({ ...prev, inRefreshPeriod: result }));
    return result;
  }
  
  // 计算下一次刷新时间
  function calculateNextRefreshTime(): Date {
    const now = new Date();
    const nextRefresh = new Date(now.getTime() + DATA_REFRESH_INTERVAL);
    
    // 检查下一次刷新是否在有效时段内
    if (!isWithinRefreshPeriod()) {
      // 如果当前不在刷新时段，则计算下一个刷新时段的开始时间
      
      // 获取北京时间（UTC+8）
      const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
      const hours = beijingTime.getUTCHours();
      
      // 计算到明天早上7:45的时间
      let nextRefreshTime = new Date(now.getTime());
      
      // 判断是否需要设置为明天
      if (hours >= REFRESH_TIME_CONFIG.START_HOUR) {
        // 已经过了今天的开始时间，设置为明天的开始时间
        nextRefreshTime.setDate(nextRefreshTime.getDate() + 1);
      }
      
      // 设置小时和分钟
      // 注意：需要从北京时间转回本地时间
      const localStartHour = (REFRESH_TIME_CONFIG.START_HOUR - 8 + nextRefreshTime.getTimezoneOffset() / 60 + 24) % 24;
      nextRefreshTime.setHours(localStartHour, REFRESH_TIME_CONFIG.START_MINUTE, 0, 0);
      
      return nextRefreshTime;
    }
    
    return nextRefresh;
  }

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null;
    
    // 更新下次刷新时间
    const updateNextRefreshTime = () => {
      const nextUpdate = calculateNextRefreshTime();
      
      // 检查并更新当前是否在刷新时段
      const isInPeriod = isWithinRefreshPeriod();
      
      // 更新刷新状态和下次更新时间
      setState(prev => ({
        ...prev,
        nextUpdateTime: nextUpdate.toLocaleTimeString(),
        refreshStatus: isInPeriod ? '活跃' : '休眠'
      }));
      
      return nextUpdate;
    };

    async function fetchAircraftData() {
      // 更新刷新状态和下次更新时间，无论是否在刷新时段内
      updateNextRefreshTime();
      
      // 重新检查是否在刷新时段内
      if (!state.inRefreshPeriod) {
        console.log('当前不在刷新时段内（北京时间7:45-22:00）');
        
        // 计算下一次刷新时间
        const nextUpdate = calculateNextRefreshTime();
        
        // 设置定时器在下一次刷新时间触发
        const timeUntilNextRefresh = nextUpdate.getTime() - new Date().getTime();
        refreshTimer = setTimeout(fetchAircraftData, timeUntilNextRefresh);
        
        // 不进行数据更新，但确保卡片仍然显示（即使没有数据）
        // 只在初始加载时设置loading为false
        setState(prev => ({ ...prev, loading: false }));
        
        return;
      }
      
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await fetch('/api/aircraft?vjc=true');
        
        if (response.status === 404) {
          // 没有找到飞机数据，但我们仍然保持卡片显示
          const data = await response.json();
          console.log('API返回404:', data.message);
          setState(prev => ({ 
            ...prev, 
            aircraftData: { B652G: null, B656E: null },
            error: null 
          }));
        } else if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        } else {
          // 成功获取数据
          const data = await response.json();
          setState(prev => ({ 
            ...prev, 
            aircraftData: data,
            error: null 
          }));
        }
        
        const currentTime = new Date();
        setState(prev => ({ 
          ...prev, 
          lastUpdated: currentTime.toLocaleTimeString() 
        }));
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : '获取飞机数据失败' 
        }));
        console.error('获取飞机数据出错:', err);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
        
        // 重新检查是否在刷新时段内
        const isInPeriod = isWithinRefreshPeriod();
        
        // 安排下一次刷新
        if (isInPeriod) {
          refreshTimer = setTimeout(fetchAircraftData, DATA_REFRESH_INTERVAL);
        } else {
          // 如果刷新周期结束，设置到下一个周期开始的定时器
          const nextUpdate = calculateNextRefreshTime();
          const timeUntilNextRefresh = nextUpdate.getTime() - new Date().getTime();
          refreshTimer = setTimeout(fetchAircraftData, timeUntilNextRefresh);
        }
      }
    }

    // 初始数据获取
    fetchAircraftData();
    
    // 清理函数
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [state.inRefreshPeriod]);

  return state;
} 