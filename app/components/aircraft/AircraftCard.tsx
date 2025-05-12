import React from 'react';
import { AircraftInfo } from '../../services/opensky';

interface AircraftCardProps {
  aircraftKey: 'B652G' | 'B656E';
  aircraft: AircraftInfo | null;
  registrationInfo: {
    registration: string;
    number: string;
    fr24Link: string;
  };
}

export function AircraftCard({ aircraftKey, aircraft, registrationInfo }: AircraftCardProps) {
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

  return (
    <a 
      href={registrationInfo.fr24Link}
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{registrationInfo.registration}（{registrationInfo.number}）</h3>
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
} 