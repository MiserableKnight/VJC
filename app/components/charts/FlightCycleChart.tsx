'use client';

import { FC } from 'react';
import { BaseChart, BaseChartProps } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useWindowSize, formatDate } from '../../utils/chartUtils';

interface FlightCycleChartProps {
  data: ChartDataItemGQL[];
  onRefresh?: () => void;
}

/**
 * 飞行循环图表组件
 * 展示当日和累计的飞行循环和航段数据
 */
export const FlightCycleChart: FC<FlightCycleChartProps> = ({ data, onRefresh }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const chartOptions = {
    title: {
      text: '飞行循环和飞行航段',
      left: 'center',
      textStyle: { fontSize: isMobile ? 14 : 18 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      valueFormatter: (value: any) => (typeof value === 'number' ? Math.round(value) : value) // 整数显示
    },
    legend: {
      data: ['飞行循环', '飞行航段', '累计飞行循环', '累计飞行航段'],
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
        data: data.map(item => item.date),
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
        name: '数量',
        min: 0,
        axisLabel: { formatter: '{value}', fontSize: isMobile ? 9 : 11 },
        nameTextStyle: { fontSize: isMobile ? 10 : 12 }
      },
      {
        type: 'value',
        name: '累计数量',
        min: 0,
        axisLabel: { formatter: '{value}', fontSize: isMobile ? 9 : 11 },
        nameTextStyle: { fontSize: isMobile ? 10 : 12 }
      }
    ],
    series: [
      {
        name: '飞行循环',
        type: 'bar',
        data: data.map(item => item.daily_fc),
        itemStyle: { color: '#1f77b4' } // 蓝色
      },
      {
        name: '飞行航段',
        type: 'bar',
        data: data.map(item => item.daily_flight_leg),
        itemStyle: { color: '#aec7e8' } // 浅蓝色
      },
      {
        name: '累计飞行循环',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.cumulative_fc),
        itemStyle: { color: '#ff7f0e' }, // 橙色
        smooth: false,
      },
      {
        name: '累计飞行航段',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.cumulative_flight_leg),
        itemStyle: { color: '#ffbb78' }, // 浅橙色
        smooth: false,
      }
    ]
  };

  return (
    <ErrorBoundary fallback={<div>飞行循环图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
}; 