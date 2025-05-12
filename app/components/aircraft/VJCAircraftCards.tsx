'use client';

import { useState, useEffect } from 'react';
import { AircraftInfo } from '../../services/opensky';

interface AircraftData {
  B652G: AircraftInfo | null;
  B656E: AircraftInfo | null;
}

// 飞机的登记号和FR24链接
const AIRCRAFT_INFO = {
  B652G: {
    registration: 'B-652G',
    number: '185',
    fr24Link: 'https://www.flightradar24.com/data/aircraft/b-652g'
  },
  B656E: {
    registration: 'B-656E',
    number: '196',
    fr24Link: 'https://www.flightradar24.com/data/aircraft/b-656e'
  }
};

// 数据刷新间隔（10分钟 = 600,000毫秒）
const DATA_REFRESH_INTERVAL = 600000;

// 北京时间刷新时段设置
const REFRESH_START_HOUR = 7;    // 早上7点
const REFRESH_START_MINUTE = 45; // 45分
const REFRESH_END_HOUR = 22;     // 晚上10点
const REFRESH_END_MINUTE = 0;    // 0分

export function VJCAircraftCards() {
  const [aircraftData, setAircraftData] = useState<AircraftData | null>({
    B652G: null,
    B656E: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [nextUpdateTime, setNextUpdateTime] = useState<string>('');
  const [refreshStatus, setRefreshStatus] = useState<string>('等待中');
  const [inRefreshPeriod, setInRefreshPeriod] = useState<boolean>(false);

  // 检查当前是否在刷新时段内
  function isWithinRefreshPeriod(): boolean {
    const now = new Date();
    
    // 获取北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
    const hours = beijingTime.getUTCHours();
    const minutes = beijingTime.getUTCMinutes();
    
    // 转换为分钟表示，方便比较
    const currentMinutes = hours * 60 + minutes;
    const startMinutes = REFRESH_START_HOUR * 60 + REFRESH_START_MINUTE;
    const endMinutes = REFRESH_END_HOUR * 60 + REFRESH_END_MINUTE;
    
    const result = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    setInRefreshPeriod(result);
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
      const minutes = beijingTime.getUTCMinutes();
      
      // 计算到明天早上7:45的时间
      let nextRefreshTime = new Date(now.getTime());
      
      // 判断是否需要设置为明天
      if (hours >= REFRESH_START_HOUR) {
        // 已经过了今天的开始时间，设置为明天的开始时间
        nextRefreshTime.setDate(nextRefreshTime.getDate() + 1);
      }
      
      // 设置小时和分钟
      // 注意：需要从北京时间转回本地时间
      const localStartHour = (REFRESH_START_HOUR - 8 + nextRefreshTime.getTimezoneOffset() / 60 + 24) % 24;
      nextRefreshTime.setHours(localStartHour, REFRESH_START_MINUTE, 0, 0);
      
      return nextRefreshTime;
    }
    
    return nextRefresh;
  }

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null;
    
    // 更新下次刷新时间
    const updateNextRefreshTime = () => {
      const nextUpdate = calculateNextRefreshTime();
      setNextUpdateTime(nextUpdate.toLocaleTimeString());
      
      // 检查并更新当前是否在刷新时段
      const isInPeriod = isWithinRefreshPeriod();
      
      // 更新刷新状态
      if (isInPeriod) {
        setRefreshStatus('活跃');
      } else {
        setRefreshStatus('休眠');
      }
      
      return nextUpdate;
    };

    async function fetchAircraftData() {
      // 更新刷新状态和下次更新时间，无论是否在刷新时段内
      updateNextRefreshTime();
      
      // 重新检查是否在刷新时段内，因为updateNextRefreshTime已经调用了isWithinRefreshPeriod
      if (!inRefreshPeriod) {
        console.log('当前不在刷新时段内（北京时间7:45-22:00）');
        
        // 计算下一次刷新时间
        const nextUpdate = calculateNextRefreshTime();
        
        // 设置定时器在下一次刷新时间触发
        const timeUntilNextRefresh = nextUpdate.getTime() - new Date().getTime();
        refreshTimer = setTimeout(fetchAircraftData, timeUntilNextRefresh);
        
        // 不进行数据更新，但确保卡片仍然显示（即使没有数据）
        // 只在初始加载时设置loading为false
        setLoading(false);
        
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/aircraft?vjc=true');
        
        if (response.status === 404) {
          // 没有找到飞机数据，但我们仍然保持卡片显示
          const data = await response.json();
          console.log('API返回404:', data.message);
          setAircraftData({ B652G: null, B656E: null });
          setError(null);
        } else if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        } else {
          // 成功获取数据
          const data = await response.json();
          setAircraftData(data);
          setError(null);
        }
        
        const currentTime = new Date();
        setLastUpdated(currentTime.toLocaleTimeString());
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取飞机数据失败');
        console.error('获取飞机数据出错:', err);
      } finally {
        setLoading(false);
        
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
  }, []);

  // 格式化飞机数据用于显示
  const formatAircraftStatus = (aircraft: AircraftInfo | null) => {
    if (!aircraft) {
      return '当前不在追踪范围内';
    }

    if (aircraft.onGround) {
      return '飞机在地面';
    }

    const speed = aircraft.velocity ? `${Math.round(aircraft.velocity * 3.6)} km/h` : 'N/A';
    const altitude = aircraft.altitude ? `${Math.round(aircraft.altitude)} 米` : 'N/A';
    
    return `飞行中 • 高度: ${altitude} • 速度: ${speed}`;
  };

  // 格式化日期时间
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
  };

  // 渲染飞机卡片
  const renderAircraftCard = (
    aircraftKey: 'B652G' | 'B656E',
    aircraft: AircraftInfo | null
  ) => {
    const info = AIRCRAFT_INFO[aircraftKey];
    
    return (
      <a 
        href={info.fr24Link}
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">{info.registration}（{info.number}）</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            aircraft?.onGround ? 'bg-gray-200 text-gray-800' : aircraft ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
          }`}>
            {aircraft ? (aircraft.onGround ? '地面' : '飞行中') : '无数据'}
          </div>
        </div>
        
        <div className="p-4">
          {aircraft ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                <div>
                  <span className="text-gray-500 text-sm">呼号:</span>
                  <p className="font-medium">{aircraft.callsign}</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">国家:</span>
                  <p className="font-medium">{aircraft.originCountry}</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">最后联系:</span>
                  <p className="font-medium">{formatDateTime(aircraft.lastContact)}</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">应答机编码:</span>
                  <p className="font-medium">{aircraft.squawk || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <p className="font-medium">{formatAircraftStatus(aircraft)}</p>
              </div>
              
              {!aircraft.onGround && (
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">经度:</span>
                    <p>{aircraft.longitude?.toFixed(4) || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">纬度:</span>
                    <p>{aircraft.latitude?.toFixed(4) || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">航向:</span>
                    <p>{aircraft.heading?.toFixed(1) || 'N/A'}°</p>
                  </div>
                  <div>
                    <span className="text-gray-500">垂直速率:</span>
                    <p>{aircraft.verticalRate ? `${aircraft.verticalRate.toFixed(1)} m/s` : 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-center text-xs text-gray-500">
                点击可查看FlightRadar信息
              </div>
            </>
          ) : (
            <div className="py-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                <div>
                  <span className="text-gray-500 text-sm">呼号:</span>
                  <p className="font-medium">--</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">国家:</span>
                  <p className="font-medium">--</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">最后联系:</span>
                  <p className="font-medium">--</p>
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">应答机编码:</span>
                  <p className="font-medium">--</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <p className="text-gray-500">当前无飞行数据</p>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                点击可查看FlightRadar信息
              </div>
            </div>
          )}
        </div>
      </a>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-6">
        <p className="font-bold">获取数据出错</p>
        <p className="text-sm">{error}</p>
        <div className="mt-4 grid grid-cols-1 gap-6">
          {renderAircraftCard('B652G', null)}
          {renderAircraftCard('B656E', null)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {renderAircraftCard('B652G', aircraftData?.B652G || null)}
        {renderAircraftCard('B656E', aircraftData?.B656E || null)}
      </div>
      
      <div className="text-right text-xs text-gray-500">
        <p>最后更新: {lastUpdated}</p>
        <p>下次更新: {nextUpdateTime}</p>
        <p>刷新状态: {refreshStatus} （刷新时段: 北京时间7:45-22:00，频率: 10分钟/次）</p>
        {!inRefreshPeriod && (
          <p className="text-orange-500 font-medium">当前不在数据刷新时段，显示的是上次获取的数据。</p>
        )}
      </div>
    </div>
  );
} 