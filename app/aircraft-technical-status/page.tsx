'use client';

import { PageLayout } from '../components/PageLayout';

export default function AircraftTechnicalStatusPage() {
  return (
    <PageLayout title="飞机技术状态">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-gray-600">飞机技术状态数据将在此显示</p>
        {/* 这里将添加飞机技术状态相关组件 */}
      </div>
    </PageLayout>
  );
} 