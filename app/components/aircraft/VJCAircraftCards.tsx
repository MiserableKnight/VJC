'use client';

import React from 'react';
import { useAircraftData } from './hooks/useAircraftData';
import { AircraftCard } from './AircraftCard';
import { RefreshStatus } from './RefreshStatus';

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

export function VJCAircraftCards() {
  const { 
    aircraftData, 
    loading, 
    error, 
    lastUpdated, 
    nextUpdateTime, 
    refreshStatus, 
    inRefreshPeriod 
  } = useAircraftData();

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
          <AircraftCard 
            aircraftKey="B652G" 
            aircraft={null} 
            registrationInfo={AIRCRAFT_INFO.B652G} 
          />
          <AircraftCard 
            aircraftKey="B656E" 
            aircraft={null} 
            registrationInfo={AIRCRAFT_INFO.B656E} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <AircraftCard 
          aircraftKey="B652G" 
          aircraft={aircraftData?.B652G || null} 
          registrationInfo={AIRCRAFT_INFO.B652G} 
        />
        <AircraftCard 
          aircraftKey="B656E" 
          aircraft={aircraftData?.B656E || null} 
          registrationInfo={AIRCRAFT_INFO.B656E} 
        />
      </div>
      
      <RefreshStatus 
        lastUpdated={lastUpdated}
        nextUpdateTime={nextUpdateTime}
        refreshStatus={refreshStatus}
        inRefreshPeriod={inRefreshPeriod}
      />
    </div>
  );
} 