'use client';

import { PageLayout } from '../components/PageLayout';
import { WeatherStations } from '../components/weather/WeatherStations';

// 防止在构建时预渲染
export const dynamic = 'force-dynamic';

export default function WeatherConditionsPage() {
  return (
    <PageLayout title="天气状况">
      <WeatherStations />
    </PageLayout>
  );
} 