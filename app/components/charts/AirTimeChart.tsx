'use client';

import { FC } from 'react';
import { BaseChart, BaseChartProps } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useWindowSize } from '../../utils/chartUtils';

interface AirTimeChartProps {
  data: ChartDataItemGQL[]; 
  onRefresh?: () => void;
}

/**
 * 空时数据图表组件
 * 展示当日和累计的空中时间与空地时间数据
 */
export const AirTimeChart: FC<AirTimeChartProps> = ({ data, onRefresh }) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const chartOptions = {
    title: {
      text: '飞行小时和轮挡小时',
      left: 'center',
      textStyle: {
        fontSize: isMobile ? 14 : 18,
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['飞行小时', '轮挡小时', '累计飞行小时', '累计轮挡小时'],
      top: 'bottom',
      textStyle: {
        fontSize: isMobile ? 10 : 12,
      }
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
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          fontSize: isMobile ? 9 : 11,
          rotate: data.length > 10 ? 45 : 0,
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '小时数',
        min: 0,
        axisLabel: {
          formatter: '{value} h',
          fontSize: isMobile ? 9 : 11,
        },
        nameTextStyle: {
          fontSize: isMobile ? 10 : 12,
        }
      },
      {
        type: 'value',
        name: '累计小时数',
        min: 0,
        axisLabel: {
          formatter: '{value} h',
          fontSize: isMobile ? 9 : 11,
        },
        nameTextStyle: {
          fontSize: isMobile ? 10 : 12,
        }
      }
    ],
    series: [
      {
        name: '飞行小时',
        type: 'bar',
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.daily_air_time),
        itemStyle: { color: '#4E79A7' }
      },
      {
        name: '轮挡小时',
        type: 'bar',
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.daily_block_time),
        itemStyle: { color: '#F28E2B' }
      },
      {
        name: '累计飞行小时',
        type: 'line',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.cumulative_air_time),
        itemStyle: { color: '#E15759' },
        smooth: false,
      },
      {
        name: '累计轮挡小时',
        type: 'line',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.cumulative_block_time),
        itemStyle: { color: '#76B7B2' },
        smooth: false,
      },
    ]
  };

  return (
    <ErrorBoundary fallback={<div>空时数据图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
}; 