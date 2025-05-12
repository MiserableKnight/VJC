'use client';

import { PageLayout } from '../components/PageLayout';
import { VJCAircraftCards } from '../components/aircraft/VJCAircraftCards';

export default function AircraftOperationalStatusPage() {
  return (
    <PageLayout title="飞机运行状态">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <VJCAircraftCards />
      </div>
    </PageLayout>
  );
} 