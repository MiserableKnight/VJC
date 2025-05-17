'use client';

import React, { FC, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors } from '../../utils/chartUtils';

interface SDRRateChartProps {
  data: ChartDataItemGQL[]; 
  onRefresh?: () => void;
}

/**
 * SDR千时率图表组件
 * 展示每千飞行小时的SDR报告数量
 */
const SDRRateChartComponent: FC<SDRRateChartProps> = ({ data, onRefresh }) => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  
  // 使用useMemo缓存图表配置，避免不必要的重新计算
  const chartOptions = useMemo(() => ({
    title: {
      text: 'SDR千时率',
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
      },
      formatter: function(params: any) {
        // 格式化工具提示，显示SDR千时率
        return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value}`;
      }
    },
    legend: {
      data: ['SDR千时率'],
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
        name: '',  // 按要求不显示Y轴标题
        min: 0,
        max: 1,  // 直接设置最大值为1，确保零值也能显示一条清晰的线
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
        name: 'SDR千时率',
        type: 'line',
        data: data.map(item => item.sdr_rate_per_1000_hours || 0),
        itemStyle: { color: chartColors[3] },  // 使用不同的颜色
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: `rgba(${parseInt(chartColors[3].slice(1, 3), 16)}, ${parseInt(chartColors[3].slice(3, 5), 16)}, ${parseInt(chartColors[3].slice(5, 7), 16)}, 0.5)`
            }, {
              offset: 1, color: `rgba(${parseInt(chartColors[3].slice(1, 3), 16)}, ${parseInt(chartColors[3].slice(3, 5), 16)}, ${parseInt(chartColors[3].slice(5, 7), 16)}, 0.1)`
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
            { type: 'average', name: '平均值' },
            { yAxis: 0, name: '零值', lineStyle: { color: '#999', type: 'dashed' } }
          ]
        }
      }
    ]
  }), [data, value, chartColors]);

  return (
    <ErrorBoundary fallback={<div>SDR千时率图表渲染失败</div>}>
      <BaseChart options={chartOptions} data={data} />
    </ErrorBoundary>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export const SDRRateChart = React.memo(SDRRateChartComponent); 