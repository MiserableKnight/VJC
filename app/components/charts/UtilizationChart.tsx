'use client';

import React, { FC, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors, formatDate } from '../../utils/chartUtils';

interface UtilizationChartProps {
  data: ChartDataItemGQL[];
  onRefresh?: () => void;
}

/**
 * 日利用率图表组件
 * 展示当日和累计的空中/空地日利用率
 */
const UtilizationChartComponent: FC<UtilizationChartProps> = ({ data, onRefresh }) => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  
  // 使用useMemo缓存图表配置
  const chartOptions = useMemo(() => ({
    title: {
      text: '日利用率（飞行小时和轮挡小时）',
      left: 'center',
      textStyle: { fontSize: value({ xs: 14, md: 18, base: 18 }) }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      valueFormatter: (value: any) => (typeof value === 'number' ? value.toFixed(2) + ' 小时/天' : value)
    },
    legend: {
      data: ['飞行小时利用率', '轮挡小时利用率', '平均飞行小时利用率', '平均轮挡小时利用率'],
      top: 'bottom',
      textStyle: { fontSize: value({ xs: 10, md: 12, base: 12 }) }
    },
    grid: {
      left: value({ xs: '3%', md: '4%', base: '4%' }),
      right: value({ xs: '4%', md: '5%', base: '5%' }),
      bottom: value({ xs: '15%', md: '12%', base: '12%' }),
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map(item => item.date), // 使用原始日期，tooltip中格式化
        axisPointer: { type: 'shadow' },
        axisLabel: {
          fontSize: value({ xs: 9, md: 11, base: 11 }),
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
        axisLabel: { formatter: '{value}', fontSize: value({ xs: 9, md: 11, base: 11 }) },
        nameTextStyle: { fontSize: value({ xs: 10, md: 12, base: 12 }) }
      }
    ],
    series: [
      {
        name: '飞行小时利用率',
        type: 'bar',
        barWidth: '25%',
        data: data.map(item => item.daily_utilization_air_time),
        itemStyle: { color: chartColors[4] }, // 使用绿色
      },
      {
        name: '轮挡小时利用率',
        type: 'bar',
        barWidth: '25%',
        data: data.map(item => item.daily_utilization_block_time),
        itemStyle: { color: chartColors[1] }, // 使用橙色
      },
      {
        name: '平均飞行小时利用率',
        type: 'line',
        data: data.map(item => item.cumulative_daily_utilization_air_time),
        itemStyle: { color: chartColors[0] }, // 使用蓝色
        smooth: false,
        symbolSize: 5,
        lineStyle: { width: 2 }
      },
      {
        name: '平均轮挡小时利用率',
        type: 'line',
        data: data.map(item => item.cumulative_daily_utilization_block_time),
        itemStyle: { color: chartColors[2] }, // 使用红色
        smooth: false,
        symbolSize: 5,
        lineStyle: { width: 2 }
      }
    ]
  }), [data, value, chartColors]);

  return (
    <ErrorBoundary fallback={<div>日利用率图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
};

// 使用React.memo避免不必要的重新渲染
export const UtilizationChart = React.memo(UtilizationChartComponent); 