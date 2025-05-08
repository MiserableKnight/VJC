'use client';

import React, { FC, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors } from '../../utils/chartUtils';

interface AirTimeChartProps {
  data: ChartDataItemGQL[]; 
  onRefresh?: () => void;
}

/**
 * 空时数据图表组件
 * 展示当日和累计的空中时间与空地时间数据
 */
const AirTimeChartComponent: FC<AirTimeChartProps> = ({ data, onRefresh }) => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  
  // 使用useMemo缓存图表配置，避免不必要的重新计算
  const chartOptions = useMemo(() => ({
    title: {
      text: '飞行小时和轮挡小时',
      left: 'center',
      textStyle: {
        fontSize: value({ xs: 14, md: 18, base: 18 }),
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
        fontSize: value({ xs: 10, md: 12, base: 12 }),
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
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          fontSize: value({ xs: 9, md: 11, base: 11 }),
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
          fontSize: value({ xs: 9, md: 11, base: 11 }),
        },
        nameTextStyle: {
          fontSize: value({ xs: 10, md: 12, base: 12 }),
        }
      },
      {
        type: 'value',
        name: '累计小时数',
        min: 0,
        axisLabel: {
          formatter: '{value} h',
          fontSize: value({ xs: 9, md: 11, base: 11 }),
        },
        nameTextStyle: {
          fontSize: value({ xs: 10, md: 12, base: 12 }),
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
        itemStyle: { color: chartColors[0] }
      },
      {
        name: '轮挡小时',
        type: 'bar',
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.daily_block_time),
        itemStyle: { color: chartColors[1] }
      },
      {
        name: '累计飞行小时',
        type: 'line',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: (value: any) => value + ' h'
        },
        data: data.map(item => item.cumulative_air_time),
        itemStyle: { color: chartColors[2] },
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
        itemStyle: { color: chartColors[3] },
        smooth: false,
      },
    ]
  }), [data, value, chartColors]);

  return (
    <ErrorBoundary fallback={<div>空时数据图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export const AirTimeChart = React.memo(AirTimeChartComponent); 