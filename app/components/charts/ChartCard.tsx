'use client';

import { FC, ReactNode, memo } from 'react';

/**
 * 图表卡片组件
 * 提供带有标题和刷新按钮的卡片容器
 */
interface ChartCardProps {
  title: string;
  onRefresh?: () => void;
  children: ReactNode;
}

const ChartCardComponent: FC<ChartCardProps> = ({ title, onRefresh, children }) => {
  return (
    <div className="bg-white p-1 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-1 sm:mb-6">
        <h2 className="text-base sm:text-xl font-semibold text-gray-800">{title}</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium py-0.5 px-2 sm:px-3 rounded-full"
          >
            刷新
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

// 使用memo包装组件，只有当props变化时才重新渲染
export const ChartCard = memo(ChartCardComponent); 