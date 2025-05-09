'use client';

import { PageLayout } from '../components/PageLayout';

export default function EconomicDataPage() {
  return (
    <PageLayout title="经济性数据">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-center text-gray-600">经济性数据将在此显示</p>
        {/* 这里将添加经济性数据相关组件 */}
      </div>
    </PageLayout>
  );
} 