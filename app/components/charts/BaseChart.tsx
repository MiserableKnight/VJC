'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  YAxisProps
} from 'recharts';
import ReactECharts from 'echarts-for-react';
import {
  getChartMargin,
  getTooltipConfig,
} from '../../utils/chartUtils';
import { logChartError } from '../../utils/errorLogger';
import { ChartDataItemGQL } from '../../context/ChartDataContext';
import { useResponsive } from '../../hooks/useResponsive';
import { 
  defaultXAxisConfig, 
  defaultYAxisConfig, 
  defaultTooltipConfig, 
  defaultLegendConfig,
  calculateChartInterval
} from '../../utils/responsiveChartConfig';

export interface BaseChartProps {
  data: ChartDataItemGQL[];
  options?: any;
  leftAxisDataKeys?: string[];
  rightAxisDataKeys?: string[];
  height?: string;
  children?: ReactNode;
  title?: string;
  chartType?: string;
}

/**
 * 基础图表组件
 * 封装了通用的图表配置和布局
 * 支持Recharts的children方式和ECharts风格的options对象配置方式
 */
export const BaseChart: FC<BaseChartProps> = ({
  data,
  options,
  leftAxisDataKeys = [],
  rightAxisDataKeys = [],
  height = 'h-[450px] sm:h-[450px] md:h-[550px]',
  children,
  title,
  chartType = 'ComposedChart'
}) => {
  const { width, isMobile, breakpoint, value } = useResponsive();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 在组件挂载和data变化时检查数据
  useEffect(() => {
    try {
      // 验证数据是否有效
      if (data && Array.isArray(data)) {
        // 如果是通过options配置的ECharts风格图表，数据验证可能不同
        if (!options) {
          const requiredKeys = [...leftAxisDataKeys, ...rightAxisDataKeys, 'date'];
          const firstItem = data[0] as ChartDataItemGQL | undefined;
          if (!firstItem && data.length > 0) {
            throw new Error('图表数据格式不正确:首个数据项为空');
          }
          if (firstItem) {
            const missingKeys = requiredKeys.filter(key => !(key in firstItem));
            if (missingKeys.length > 0) {
              throw new Error(`数据缺少必要字段: ${missingKeys.join(', ')}`);
            }
          }
        }
      }
      
      // 重置错误状态
      if (hasError) {
        setHasError(false);
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error(`图表数据验证错误:`, error);
      setHasError(true);
      setErrorMessage(error.message || '图表数据错误');
      logChartError(error, chartType || options?.series?.[0]?.type || 'UnknownChart', data);
    }
  }, [data, leftAxisDataKeys, rightAxisDataKeys, chartType, options, hasError]);
  
  // 数据为空时显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="h-64 sm:h-80 w-full flex justify-center items-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }
  
  // 发生错误时显示错误状态
  if (hasError) {
    return (
      <div className="h-64 sm:h-80 w-full flex flex-col justify-center items-center bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-red-500 font-medium mb-2">图表渲染错误</p>
        <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
        <button 
          onClick={() => setHasError(false)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          尝试重载图表
        </button>
      </div>
    );
  }
  
  // 如果提供了options，则使用ECharts渲染图表
  if (options) {
    const heightClass = height.includes('px') ? height : 'h-[450px]';
    const heightValue = heightClass.match(/\d+/)?.[0] || '450';
    
    return (
      <div className={`${height} w-full overflow-hidden`}>
        <ReactECharts
          option={options}
          style={{ height: `${heightValue}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  }

  // 以下为Recharts的渲染逻辑
  const getYAxisDomain = (keys: string[]): YAxisProps['domain'] => {
    if (!data || data.length === 0) return [0, 'auto'];
    let max = 0;
    data.forEach(item => {
      keys.forEach(key => {
        const value = parseFloat(String((item as any)[key])) || 0;
        if (value > max) max = value;
      });
    });
    const calculatedMax = Math.ceil(max * 1.1 / 5) * 5;
    return [0, calculatedMax > 0 ? calculatedMax : 'auto'];
  };
  
  // 获取响应式配置
  const xAxisConfig = value(defaultXAxisConfig);
  const yAxisConfig = value(defaultYAxisConfig);
  const tooltipConfig = value(defaultTooltipConfig);
  const legendConfig = value(defaultLegendConfig);
  const interval = calculateChartInterval(data.length, breakpoint);
  
  return (
    <div className={`${height} w-full overflow-x-auto`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={getChartMargin(width, data.length > 0 ? data.length : 1)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(dateStr: string) => {
              if (!dateStr) return '';
              try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
              } catch (e) {
                return dateStr;
              }
            }}
            angle={-45} 
            textAnchor="end"
            height={xAxisConfig.height}
            dy={xAxisConfig.dy}
            padding={xAxisConfig.padding}
            scale="point"
            type="category"
            interval={interval}
            tick={{ fontSize: xAxisConfig.tick.fontSize }}
          />
          <YAxis 
            yAxisId="left"
            width={yAxisConfig.width}
            tick={{ fontSize: yAxisConfig.tick.fontSize }}
            domain={getYAxisDomain(leftAxisDataKeys)}
            allowDataOverflow={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            width={yAxisConfig.width}
            tick={{ fontSize: yAxisConfig.tick.fontSize }}
            domain={getYAxisDomain(rightAxisDataKeys)}
            allowDataOverflow={false}
          />
          <Tooltip 
            wrapperStyle={tooltipConfig.wrapperStyle}
            labelFormatter={(label: string) => {
              if (!label) return '';
              try {
                const date = new Date(label);
                return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
              } catch (e) {
                return label;
              }
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={legendConfig.height} 
            wrapperStyle={legendConfig.wrapperStyle} 
            iconSize={legendConfig.iconSize}
            iconType="circle"
            align="center"
          />
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}; 