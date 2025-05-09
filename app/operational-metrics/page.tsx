'use client';

import { ChartsContainer } from '../components/charts/ChartsContainer';
import { ChartDataProvider } from '../context/ChartDataContext';
import { PageLayout } from '../components/PageLayout';

export default function OperationalMetricsPage() {
  return (
    <PageLayout title="运行指标">
      <ChartDataProvider>
        <ChartsContainer />
      </ChartDataProvider>
    </PageLayout>
  );
} 