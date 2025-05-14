'use client';

import { PageLayout } from '../components/PageLayout';
import { AircraftLegDataTable } from '../components/aircraft/AircraftLegDataTable';
import { FlightRadarService } from '../services/flightRadarService';
import Link from 'next/link';

// 飞机注册号
const AIRCRAFT_INFO = {
  B652G: {
    operating_aircraft: 'B-652G',
    number: '185'
  },
  B656E: {
    operating_aircraft: 'B-656E',
    number: '196'
  }
};

export default function AircraftOperationalStatusPage() {
  // 生成FlightRadar24链接
  const getFlightRadarUrl = (registration: string) => {
    return FlightRadarService.getFlightRadarUrl(registration);
  };

  return (
    <PageLayout title="飞机运行状态">
      <div className="space-y-6">
        {Object.values(AIRCRAFT_INFO).map((aircraft) => (
          <div key={aircraft.operating_aircraft} className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {aircraft.operating_aircraft}（{aircraft.number}）
            </h2>
            <AircraftLegDataTable registration={aircraft.operating_aircraft} />
            
            <div className="mt-4 flex justify-end">
              <a 
                href={getFlightRadarUrl(aircraft.operating_aircraft)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <span>在FlightRadar24查看</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
} 