/**
 * 图表通用工具函数
 */

/**
 * 格式化日期显示
 */
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch (e) {
    return dateStr;
  }
};

/**
 * 安全获取对象属性值
 */
export const safeGetProperty = (obj: any, key: string, defaultValue: any = 0) => {
  if (!obj) return defaultValue;
  return obj[key] !== undefined ? obj[key] : defaultValue;
};

/**
 * 计算数据最大值，用于设置Y轴范围
 */
export const calculateMaxValue = (data: any[], keys: string[]) => {
  if (!data || data.length === 0) return 10;
  
  // 对每个键分别计算最大值
  const maxValues: Record<string, number> = {};
  keys.forEach(key => {
    maxValues[key] = 0;
  });
  
  // 遍历所有数据，找出每个指标的最大值
  data.forEach(item => {
    keys.forEach(key => {
      const value = parseFloat(item[key]) || 0;
      if (value > maxValues[key]) {
        maxValues[key] = value;
      }
    });
  });
  
  // 找出所有指标中的最大值
  let absoluteMax = 0;
  keys.forEach(key => {
    if (maxValues[key] > absoluteMax) {
      absoluteMax = maxValues[key];
    }
  });
  
  // 对最大值进行适当处理，使用1.1倍数并向上取整到最近的5的倍数
  return Math.ceil(absoluteMax * 1.1 / 5) * 5;
};

/**
 * 获取窗口宽度
 */
export const getWindowWidth = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  // 默认移动设备宽度
  return 375;
};

/**
 * 基于窗口宽度判断是否为移动设备
 */
export const isMobileDevice = (width: number) => {
  return width < 768;
};

/**
 * 创建图表通用的margin配置
 */
export const getChartMargin = (windowWidth: number, dataLength: number) => {
  const isMobile = isMobileDevice(windowWidth);
  return { 
    top: 20, 
    right: isMobile ? 15 : 30, 
    left: isMobile ? 10 : 20, 
    bottom: dataLength > 10 ? 90 : 60 
  };
};

/**
 * 获取X轴通用配置
 */
export const getXAxisConfig = (windowWidth: number, dataLength: number) => {
  const isMobile = isMobileDevice(windowWidth);
  return {
    dataKey: "date",
    tickFormatter: formatDate,
    angle: -45,
    textAnchor: "end",
    height: isMobile ? 60 : 80,
    dy: isMobile ? 10 : 20,
    padding: { left: isMobile ? 10 : 20, right: isMobile ? 10 : 20 },
    scale: "point",
    type: "category",
    interval: Math.max(1, Math.floor(dataLength / (isMobile ? 10 : 20))),
    tick: { fontSize: isMobile ? 10 : 12 }
  };
};

/**
 * 获取Y轴通用配置
 */
export const getYAxisConfig = (windowWidth: number, keys: string[], data: any[], orientation: 'left' | 'right' = 'left') => {
  const isMobile = isMobileDevice(windowWidth);
  return {
    yAxisId: orientation,
    orientation: orientation,
    width: isMobile ? 40 : 50,
    tick: { fontSize: isMobile ? 10 : 12 },
    domain: [0, calculateMaxValue(data, keys)]
  };
};

/**
 * 获取Tooltip通用配置
 */
export const getTooltipConfig = (windowWidth: number) => {
  const isMobile = isMobileDevice(windowWidth);
  return {
    labelFormatter: formatDate,
    wrapperStyle: { 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '8px',
      fontSize: isMobile ? '12px' : '14px'
    }
  };
};

/**
 * 获取Legend通用配置
 */
export const getLegendConfig = (windowWidth: number) => {
  const isMobile = isMobileDevice(windowWidth);
  return {
    verticalAlign: "bottom",
    height: isMobile ? 45 : 60,
    wrapperStyle: { paddingTop: isMobile ? '5px' : '10px' },
    iconSize: isMobile ? 8 : 10,
    iconType: "circle"
  };
};

/**
 * 获取Bar图通用配置
 */
export const getBarConfig = (windowWidth: number, dataKey: string, name: string, fill: string, yAxisId: string = 'left') => {
  const isMobile = isMobileDevice(windowWidth);
  return {
    yAxisId,
    dataKey,
    name,
    fill,
    barSize: isMobile ? 10 : 20
  };
};

/**
 * 获取Line图通用配置
 */
export const getLineConfig = (windowWidth: number, dataKey: string, name: string, stroke: string, yAxisId: string = 'right', showActiveDot: boolean = false) => {
  const isMobile = isMobileDevice(windowWidth);
  const config = {
    yAxisId,
    type: "monotone",
    dataKey,
    name,
    stroke,
    connectNulls: true,
    dot: { r: isMobile ? 2 : 4 },
    strokeWidth: isMobile ? 2 : 3
  };
  
  if (showActiveDot) {
    return {
      ...config,
      activeDot: { r: isMobile ? 4 : 8 }
    };
  }
  
  return config;
};

/**
 * 使用自定义Hook管理窗口尺寸
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: getWindowWidth(),
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return windowSize;
};

// 需要导入的类型和hooks
import { useState, useEffect } from 'react'; 