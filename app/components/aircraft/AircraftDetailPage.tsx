'use client';

import { AircraftFlightHistoryTable } from './AircraftFlightHistoryTable';
import Link from 'next/link';

export function AircraftDetailPage({ registration }: { registration: string }) {
  return (
    <div className="space-y-6">
      {/* 飞行历史表格 */}
      <AircraftFlightHistoryTable registration={registration} />
      
      {/* 操作链接 */}
      <div className="mt-4 flex gap-4">
        <Link href="/aircraft-operational-status" className="text-blue-600 hover:underline">
          ← 返回飞机列表
        </Link>
        
        <a
          href={`https://www.flightradar24.com/data/aircraft/${registration.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <span>在FlightRadar24官网查看</span>
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
  );
} 