'use client';

import React, { FC, useState, useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { ErrorBoundary } from '../ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { getChartColors } from '../../utils/chartUtils';
import { gql, useQuery } from '@apollo/client';
import Select from '../ui/Select';
import { ChartDataItemGQL } from '../../context/ChartDataContext';

// GraphQL查询 - 获取单架机故障统计
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

// GraphQL查询 - 获取机队列表
const GET_ALL_AIRCRAFT = gql`
  query GetAllAircraft {
    getAllAircraft {
      registration
      msn
    }
  }
`;

interface AircraftFailureStats {
  registration: string;
  msn: string;
  failure_rate_per_1000_hours: number;
  total_failures: number;
  cumulative_air_time: number;
}

interface Aircraft {
  registration: string;
  msn: string;
}

// 为了满足BaseChart的data要求创建一个空的符合ChartDataItemGQL的数据对象
const emptyChartData: ChartDataItemGQL[] = [{ date: "" }];

/**
 * 单架机故障千时率图表组件
 */
const AircraftFailureRateChartComponent: FC = () => {
  const { value } = useResponsive();
  const chartColors = getChartColors();
  const [selectedAircraft, setSelectedAircraft] = useState<string>('全部机队');
  
  // 查询故障统计数据
  const { loading: statsLoading, error: statsError, data: statsData } = useQuery(GET_AIRCRAFT_FAILURE_STATS);
  
  // 查询机队列表
  const { loading: aircraftLoading, error: aircraftError, data: aircraftData } = useQuery(GET_ALL_AIRCRAFT);
  
  // 处理加载中状态
  if (statsLoading || aircraftLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-xl">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 处理错误状态
  if (statsError || aircraftError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-xl font-medium text-red-800 mb-3">数据加载错误</h3>
        <p className="text-lg text-red-600 mb-4">{statsError?.message || aircraftError?.message}</p>
      </div>
    );
  }
  
  // 获取故障统计数据
  const failureStats: AircraftFailureStats[] = statsData?.getAircraftFailureStats || [];
  
  // 获取机队列表
  const aircraftList: Aircraft[] = aircraftData?.getAllAircraft || [];
  
  // 构建飞机下拉选项
  const aircraftOptions = [
    { value: '全部机队', label: '全部机队' },
    ...aircraftList.map(aircraft => ({
      value: aircraft.registration,
      label: `${aircraft.registration} (MSN: ${aircraft.msn})`
    }))
  ];
  
  // 根据所选飞机筛选数据
  const filteredData = useMemo(() => {
    if (selectedAircraft === '全部机队') {
      return failureStats;
    }
    return failureStats.filter(stat => stat.registration === selectedAircraft);
  }, [selectedAircraft, failureStats]);
  
  // 计算机队平均值
  const fleetAverage = useMemo(() => {
    if (failureStats.length === 0) return 0;
    const totalFailures = failureStats.reduce((sum, stat) => sum + stat.total_failures, 0);
    const totalAirTime = failureStats.reduce((sum, stat) => sum + stat.cumulative_air_time, 0);
    return totalAirTime > 0 ? parseFloat(((1000 * totalFailures) / totalAirTime).toFixed(2)) : 0;
  }, [failureStats]);
  
  // 构建图表选项
  const chartOptions = useMemo(() => {
    // 如果选择了全部机队，显示每架飞机的故障千时率的条形图
    if (selectedAircraft === '全部机队') {
      return {
        title: {
          text: '机队故障千时率',
          left: 'center',
          textStyle: {
            fontSize: value({ xs: 14, md: 18, base: 18 }),
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const data = params[0];
            return `${data.name}<br/>
                    ${data.marker}故障千时率: ${data.value}<br/>
                    故障总数: ${failureStats.find(stat => stat.registration === data.name)?.total_failures || 0}<br/>
                    飞行小时: ${failureStats.find(stat => stat.registration === data.name)?.cumulative_air_time.toFixed(1) || 0}`;
          }
        },
        grid: {
          left: value({ xs: '3%', md: '4%', base: '4%' }),
          right: value({ xs: '4%', md: '5%', base: '5%' }),
          bottom: value({ xs: '20%', md: '15%', base: '15%' }),
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: failureStats.map(stat => stat.registration),
          axisLabel: {
            rotate: 45,
            fontSize: value({ xs: 9, md: 11, base: 11 }),
          }
        },
        yAxis: {
          type: 'value',
          name: '每千小时故障数',
          axisLabel: {
            formatter: '{value}',
            fontSize: value({ xs: 9, md: 11, base: 11 }),
          },
          nameTextStyle: {
            fontSize: value({ xs: 10, md: 12, base: 12 }),
          }
        },
        series: [
          {
            name: '故障千时率',
            type: 'bar',
            data: failureStats.map(stat => stat.failure_rate_per_1000_hours),
            itemStyle: {
              color: (params: any) => {
                // 根据值的大小设置不同颜色
                const value = params.value;
                if (value > fleetAverage * 1.5) return chartColors[3]; // 显著高于平均值
                if (value > fleetAverage) return chartColors[1]; // 高于平均值
                return chartColors[2]; // 低于或等于平均值
              }
            },
            markLine: {
              data: [
                {
                  name: '机队平均',
                  yAxis: fleetAverage,
                  label: {
                    formatter: '机队平均: {c}',
                    position: 'middle',
                    distance: 10
                  },
                  lineStyle: {
                    type: 'dashed',
                    width: 2
                  }
                }
              ]
            }
          }
        ]
      };
    } else {
      // 如果选择了单架机，显示该飞机的详细信息
      const selectedData = failureStats.find(stat => stat.registration === selectedAircraft);
      if (!selectedData) return {};
      
      return {
        title: {
          text: `${selectedData.registration} 故障千时率`,
          left: 'center',
          textStyle: {
            fontSize: value({ xs: 14, md: 18, base: 18 }),
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [
          {
            name: `${selectedData.registration} 故障统计`,
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            data: [
              { 
                value: selectedData.failure_rate_per_1000_hours, 
                name: '故障千时率',
                itemStyle: { color: chartColors[0] }
              },
              { 
                value: selectedData.total_failures, 
                name: '故障总数',
                itemStyle: { color: chartColors[1] }
              },
              { 
                value: parseFloat(selectedData.cumulative_air_time.toFixed(1)), 
                name: '飞行小时',
                itemStyle: { color: chartColors[2] }
              }
            ]
          }
        ]
      };
    }
  }, [selectedAircraft, failureStats, value, chartColors, fleetAverage]);
  
  // 处理飞机选择变化
  const handleAircraftChange = (value: string) => {
    setSelectedAircraft(value);
  };

  return (
    <ErrorBoundary fallback={<div>故障千时率图表渲染失败</div>}>
      <div className="mb-4 flex justify-end">
        <div className="w-72">
          <Select
            id="aircraft-select"
            label="选择飞机"
            options={aircraftOptions}
            value={selectedAircraft}
            onChange={handleAircraftChange}
          />
        </div>
      </div>
      <BaseChart options={chartOptions} data={emptyChartData} />
    </ErrorBoundary>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export const AircraftFailureRateChart = React.memo(AircraftFailureRateChartComponent); 