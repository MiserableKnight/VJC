'use client';

import React, { FC, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors } from '../../utils/chartUtils';
import { gql, useQuery } from '@apollo/client';

// 添加查询获取单架机故障千时率数据
const GET_AIRCRAFT_FAILURE_STATS = gql`
  query GetAircraftFailureStats {
    getAircraftFailureStats {
      registration
      msn
      failure_rate_per_1000_hours
      total_failures
      cumulative_air_time
    }
  }
`;

interface FailureRateChartProps {
  data: ChartDataItemGQL[]; 
  onRefresh?: () => void;
}

interface AircraftFailureStats {
  registration: string;
  msn: string;
  failure_rate_per_1000_hours: number;
  total_failures: number;
  cumulative_air_time: number;
}

/**
 * 故障千时率图表组件
 * 展示飞机每千小时故障次数
 */
const FailureRateChartComponent: FC<FailureRateChartProps> = ({ data, onRefresh }) => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  
  // 查询单架机故障统计数据
  const { loading: statsLoading, error: statsError, data: statsData } = useQuery(GET_AIRCRAFT_FAILURE_STATS);
  
  // 获取单架机故障千时率数据
  const aircraftFailureStats: AircraftFailureStats[] = statsData?.getAircraftFailureStats || [];
  
  // 整理单架机数据
  const aircraftSeries = useMemo(() => {
    if (!aircraftFailureStats.length) return [];
    
    // 将单架机数据按照千时率从高到低排序，选择前5个飞机（可根据需要调整）
    const topAircraft = [...aircraftFailureStats]
      .sort((a, b) => b.failure_rate_per_1000_hours - a.failure_rate_per_1000_hours)
      .slice(0, 5);
    
    return topAircraft.map((aircraft, index) => ({
      name: aircraft.registration,
      type: 'line',
      data: data.map(() => aircraft.failure_rate_per_1000_hours), // 为每个日期点重复同一个值
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { 
        width: 2,
        type: 'dashed',
      },
      itemStyle: { 
        color: chartColors[(index + 4) % chartColors.length] 
      },
    }));
  }, [aircraftFailureStats, data, chartColors]);
  
  // 使用useMemo缓存图表配置，避免不必要的重新计算
  const chartOptions = useMemo(() => ({
    title: {
      text: '故障千时率',
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
      data: ['机队故障千时率', ...aircraftSeries.map(s => s.name)],
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
        name: '每千小时故障数',
        min: 0,
        axisLabel: {
          formatter: '{value}',
          fontSize: value({ xs: 9, md: 11, base: 11 }),
        },
        nameTextStyle: {
          fontSize: value({ xs: 10, md: 12, base: 12 }),
        }
      }
    ],
    series: [
      {
        name: '机队故障千时率',
        type: 'line',
        data: data.map(item => item.failure_rate_per_1000_hours),
        itemStyle: { color: chartColors[0] },
        smooth: false,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: `rgba(${parseInt(chartColors[0].slice(1, 3), 16)}, ${parseInt(chartColors[0].slice(3, 5), 16)}, ${parseInt(chartColors[0].slice(5, 7), 16)}, 0.5)`
            }, {
              offset: 1, color: `rgba(${parseInt(chartColors[0].slice(1, 3), 16)}, ${parseInt(chartColors[0].slice(3, 5), 16)}, ${parseInt(chartColors[0].slice(5, 7), 16)}, 0.1)`
            }]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高值' },
            { type: 'min', name: '最低值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      },
      ...aircraftSeries
    ]
  }), [data, value, chartColors, aircraftSeries]);

  // 处理加载状态
  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div>故障千时率图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export const FailureRateChart = React.memo(FailureRateChartComponent); 