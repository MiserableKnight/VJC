'use client';

import { FC } from 'react';
import { BaseChart, BaseChartProps } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useWindowSize, formatDate } from '../../utils/chartUtils';

interface UtilizationChartProps {
  data: ChartDataItemGQL[];
  onRefresh?: () => void;
}

/**
 * 日利用率图表组件
 * 展示当日和累计的空中/空地日利用率
 */
export const UtilizationChart: FC<UtilizationChartProps> = ({ data, onRefresh }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const chartOptions = {
    title: {
      text: '日利用率（飞行小时和轮挡小时）',
      left: 'center',
      textStyle: { fontSize: isMobile ? 14 : 18 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      valueFormatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) + ' 小时/天' : value)
    },
    legend: {
      data: ['飞行小时利用率', '轮挡小时利用率'],
      top: 'bottom',
      textStyle: { fontSize: isMobile ? 10 : 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map(item => item.date), // 使用原始日期，tooltip中格式化
        axisPointer: { type: 'shadow' },
        axisLabel: {
          fontSize: isMobile ? 9 : 11,
          rotate: data.length > 10 ? 45 : 0,
          formatter: (value: string) => formatDate(value) // X轴标签格式化日期
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '利用率 (小时/天)',
        min: 0,
        axisLabel: { formatter: '{value}', fontSize: isMobile ? 9 : 11 },
        nameTextStyle: { fontSize: isMobile ? 10 : 12 }
      }
    ],
    series: [
      {
        name: '飞行小时利用率',
        type: 'line',
        data: data.map(item => item.daily_utilization_air_time),
        itemStyle: { color: '#2ca02c' }, // 鲜绿色
        smooth: false,
        areaStyle: { opacity: 0.3 }
      },
      {
        name: '轮挡小时利用率',
        type: 'line',
        data: data.map(item => item.daily_utilization_block_time),
        itemStyle: { color: '#ff7f0e' }, // 橙色
        smooth: false,
        areaStyle: { opacity: 0.3 }
      }
    ]
  };

  return (
    <ErrorBoundary fallback={<div>日利用率图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
}; 