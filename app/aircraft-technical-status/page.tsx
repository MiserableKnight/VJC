'use client';

import { PageLayout } from '../components/PageLayout';
import { AircraftFailure } from '../components/aircraft/AircraftFailure';

export default function AircraftTechnicalStatusPage() {
  return (
    <PageLayout title="飞机技术状态">
      <div className="space-y-6">
        <AircraftFailure />
      </div>
    </PageLayout>
  );
} 