'use client';

import { PageLayout } from '../components/PageLayout';
import { AircraftFailure } from '../components/aircraft/AircraftFailure';

// 防止在构建时预渲染
export const dynamic = 'force-dynamic';

export default function AircraftTechnicalStatusPage() {
  return (
    <PageLayout title="飞机技术状态">
      <div className="space-y-6">
        <AircraftFailure />
      </div>
    </PageLayout>
  );
} 