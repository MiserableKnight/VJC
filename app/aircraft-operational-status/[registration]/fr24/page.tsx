'use client';

import { useParams } from 'next/navigation';
import { PageLayout } from '../../../components/PageLayout';
import { FlightRadar24DataTable } from '../../../components/external/FlightRadar24DataTable';
import Link from 'next/link';

export default function FlightRadar24Page() {
  const params = useParams();
  const registration = Array.isArray(params.registration) 
    ? params.registration[0] 
    : params.registration || '';

  return (
    <PageLayout title={`${registration} - Flightradar24数据`}>
      <div className="space-y-6">
        <div className="mb-4 flex items-center">
          <Link 
            href={`/aircraft-operational-status/${registration}`}
            className="text-blue-600 hover:underline mr-4"
          >
            ← 返回飞机详情
          </Link>
          
          <a 
            href={`https://www.flightradar24.com/data/aircraft/${registration.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span>在Flightradar24查看</span>
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
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-yellow-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                此页面展示的数据基于Flightradar24网站。由于我们系统目前尚未与其API进行实时连接，
                页面展示的是模拟数据。在实际生产环境中，这些数据将从Flightradar24的API获取并实时更新。
              </p>
            </div>
          </div>
        </div>
        
        <FlightRadar24DataTable registration={registration} />
      </div>
    </PageLayout>
  );
}