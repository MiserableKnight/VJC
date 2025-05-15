'use client';

import React, { FC, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors, formatDate } from '../../utils/chartUtils';

interface FlightCycleChartProps {
  data: ChartDataItemGQL[];
  onRefresh?: () => void;
}

/**
 * 飞行循环图表组件
 * 展示当日和累计的飞行循环和航段数据
 */
const FlightCycleChartComponent: FC<FlightCycleChartProps> = ({ data, onRefresh }) => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  
  // 使用useMemo缓存图表配置
  const chartOptions = useMemo(() => ({
    title: {
      text: '飞行循环和飞行航段',
      left: 'center',
      textStyle: { fontSize: value({ xs: 14, md: 18, base: 18 }) }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      valueFormatter: (value: any) => (typeof value === 'number' ? Math.round(value) : value) // 整数显示
    },
    legend: {
      data: ['飞行循环', '飞行航段', '累计飞行循环', '累计飞行航段'],
      top: 'bottom',
      textStyle: { fontSize: value({ xs: 10, md: 12, base: 12 }) },
      selected: {
        '飞行循环': true,
        '累计飞行循环': true,
        '飞行航段': false,
        '累计飞行航段': false
      }
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
        data: data.map(item => item.date),
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
        name: '数量',
        min: 0,
        axisLabel: { formatter: '{value}', fontSize: value({ xs: 9, md: 11, base: 11 }) },
        nameTextStyle: { fontSize: value({ xs: 10, md: 12, base: 12 }) }
      },
      {
        type: 'value',
        name: '累计数量',
        min: 0,
        axisLabel: { formatter: '{value}', fontSize: value({ xs: 9, md: 11, base: 11 }) },
        nameTextStyle: { fontSize: value({ xs: 10, md: 12, base: 12 }) }
      }
    ],
    series: [
      {
        name: '飞行循环',
        type: 'bar',
        data: data.map(item => item.daily_fc),
        itemStyle: { color: chartColors[0] }
      },
      {
        name: '飞行航段',
        type: 'bar',
        data: data.map(item => item.daily_flight_leg),
        itemStyle: { color: chartColors[1] }
      },
      {
        name: '累计飞行循环',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.cumulative_fc),
        itemStyle: { color: chartColors[2] },
        smooth: false,
      },
      {
        name: '累计飞行航段',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.cumulative_flight_leg),
        itemStyle: { color: chartColors[3] },
        smooth: false,
      }
    ]
  }), [data, value, chartColors]);

  return (
    <ErrorBoundary fallback={<div>飞行循环图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
};

// 使用React.memo避免不必要的重新渲染
export const FlightCycleChart = React.memo(FlightCycleChartComponent); 