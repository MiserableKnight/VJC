'use client';

import { PageLayout } from '../components/PageLayout';
import { EconomicDataTable } from '../components/economic/EconomicDataTable';

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

export default function EconomicDataPage() {
  return (
    <PageLayout title="经济性数据">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">B-652G（185）</h2>
          <EconomicDataTable registration={AIRCRAFT_INFO.B652G.operating_aircraft} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">B-656E（196）</h2>
          <EconomicDataTable registration={AIRCRAFT_INFO.B656E.operating_aircraft} />
        </div>
      </div>
    </PageLayout>
  );
} 