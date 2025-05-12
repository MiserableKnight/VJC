'use client';

import { useParams } from 'next/navigation';
import { PageLayout } from '../../components/PageLayout';
import { AircraftDetailPage } from '../../components/aircraft/AircraftDetailPage';

export default function AircraftDetail() {
  const params = useParams();
  const registration = Array.isArray(params.registration) 
    ? params.registration[0] 
    : params.registration || '';

  return (
    <PageLayout title={`飞机 ${registration} 运行状态`}>
      <AircraftDetailPage registration={registration} />
    </PageLayout>
  );
} 