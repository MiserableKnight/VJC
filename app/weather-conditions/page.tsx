'use client';

import { PageLayout } from '../components/PageLayout';
import { WeatherStations } from '../components/weather/WeatherStations';

export default function WeatherConditionsPage() {
  return (
    <PageLayout title="天气状况">
      <WeatherStations />
    </PageLayout>
  );
} 