'use client';

/**
 * 格式化日期
 * @param dateStr ISO日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

/**
 * 安全获取对象属性
 */
export const safeGetProperty = (obj: any, key: string, defaultValue: any = 0) => {
  return obj && key in obj ? obj[key] : defaultValue;
};

/**
 * 计算数据集中的最大值
 */
export const calculateMaxValue = (data: any[], keys: string[]) => {
  if (!data || data.length === 0 || !keys || keys.length === 0) {
    return 100; // 默认返回一个合理的最大值
  }
  
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
 * 根据屏幕宽度和数据长度获取图表边距
 */
export function getChartMargin(width: number, dataLength: number) {
  // 根据数据长度调整左右边距
  const baseLeft = width < 768 ? 5 : 20;
  const baseRight = width < 768 ? 15 : 30;
  const baseBottom = dataLength > 10 ? (width < 768 ? 100 : 70) : (width < 768 ? 60 : 40);
  
  return {
    top: 20,
    right: baseRight,
    bottom: baseBottom,
    left: baseLeft,
  };
}

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
 * 获取图表的Tooltip配置
 */
export function getTooltipConfig(width: number) {
  return {
    wrapperStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: width < 768 ? '6px' : '10px',
      fontSize: width < 768 ? '12px' : '14px',
    },
  };
}

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
 * 获取图表的通用主题颜色
 */
export function getChartColors() {
  return [
    '#4E79A7', // 蓝色
    '#F28E2B', // 橙色
    '#E15759', // 红色
    '#76B7B2', // 青色
    '#59A14F', // 绿色
    '#EDC948', // 黄色
    '#B07AA1', // 紫色
    '#FF9DA7', // 粉色
    '#9C755F', // 棕色
    '#BAB0AC'  // 灰色
  ];
}

/**
 * 获取日利用率图表的渐变色
 */
export function getUtilizationGradient(id: string, color: string) {
  return {
    id,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: color },
      { offset: 1, color: `${color}33` } // 添加透明度
    ]
  };
} 