'use client';

import { PageLayout } from '../components/PageLayout';
import { AircraftFleet } from '../components/aircraft/AircraftFleet';

export default function AircraftOperationalStatusPage() {
  return (
    <PageLayout title="飞机运行状态">
      <AircraftFleet />
    </PageLayout>
  );
} 