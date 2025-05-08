'use client';

import { Breakpoint, ResponsiveValue } from '../hooks/useResponsive';

// 图表Margin配置
export type ChartMargin = {
  top: number;
  right: number;
  left: number;
  bottom: number;
};

// X轴配置
export interface XAxisConfig {
  height: number;
  dy: number;
  padding: {
    left: number;
    right: number;
  };
  interval: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
  tick: {
    fontSize: number;
  };
}

// Y轴配置
export interface YAxisConfig {
  width: number;
  tick: {
    fontSize: number;
  };
}

// Tooltip配置
export interface TooltipConfig {
  wrapperStyle: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
  };
}

// Legend配置
export interface LegendConfig {
  height: number;
  wrapperStyle: {
    paddingTop: string;
  };
  iconSize: number;
}

// Bar配置
export interface BarConfig {
  barSize: number;
}

// Line配置
export interface LineConfig {
  strokeWidth: number;
  dot: {
    r: number;
  };
  activeDot?: {
    r: number;
  };
}

/**
 * 默认图表Margin配置
 */
export const defaultChartMargin: ResponsiveValue<ChartMargin> = {
  xs: { top: 20, right: 15, left: 10, bottom: 60 },
  sm: { top: 20, right: 20, left: 15, bottom: 70 },
  md: { top: 20, right: 30, left: 20, bottom: 80 },
  lg: { top: 20, right: 30, left: 20, bottom: 60 },
  base: { top: 20, right: 30, left: 20, bottom: 60 }
};

/**
 * 默认X轴配置
 */
export const defaultXAxisConfig: ResponsiveValue<XAxisConfig> = {
  xs: {
    height: 60,
    dy: 10,
    padding: { left: 10, right: 10 },
    interval: 'preserveStartEnd',
    tick: { fontSize: 10 }
  },
  sm: {
    height: 70,
    dy: 15,
    padding: { left: 15, right: 15 },
    interval: 'preserveStartEnd',
    tick: { fontSize: 11 }
  },
  md: {
    height: 80,
    dy: 20,
    padding: { left: 20, right: 20 },
    interval: 0,
    tick: { fontSize: 12 }
  },
  lg: {
    height: 80,
    dy: 20,
    padding: { left: 20, right: 20 },
    interval: 0,
    tick: { fontSize: 12 }
  },
  base: {
    height: 80,
    dy: 20,
    padding: { left: 20, right: 20 },
    interval: 0,
    tick: { fontSize: 12 }
  }
};

/**
 * 默认Y轴配置
 */
export const defaultYAxisConfig: ResponsiveValue<YAxisConfig> = {
  xs: { width: 40, tick: { fontSize: 10 } },
  sm: { width: 45, tick: { fontSize: 11 } },
  md: { width: 50, tick: { fontSize: 12 } },
  base: { width: 50, tick: { fontSize: 12 } }
};

/**
 * 默认Tooltip配置
 */
export const defaultTooltipConfig: ResponsiveValue<TooltipConfig> = {
  xs: {
    wrapperStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '6px',
      fontSize: '12px'
    }
  },
  sm: {
    wrapperStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '12px'
    }
  },
  md: {
    wrapperStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px'
    }
  },
  base: {
    wrapperStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px'
    }
  }
};

/**
 * 默认Legend配置
 */
export const defaultLegendConfig: ResponsiveValue<LegendConfig> = {
  xs: { height: 45, wrapperStyle: { paddingTop: '5px' }, iconSize: 8 },
  sm: { height: 50, wrapperStyle: { paddingTop: '8px' }, iconSize: 9 },
  md: { height: 60, wrapperStyle: { paddingTop: '10px' }, iconSize: 10 },
  base: { height: 60, wrapperStyle: { paddingTop: '10px' }, iconSize: 10 }
};

/**
 * 默认Bar配置
 */
export const defaultBarConfig: ResponsiveValue<BarConfig> = {
  xs: { barSize: 10 },
  sm: { barSize: 15 },
  md: { barSize: 20 },
  base: { barSize: 20 }
};

/**
 * 默认Line配置
 */
export const defaultLineConfig: ResponsiveValue<LineConfig> = {
  xs: { 
    strokeWidth: 2, 
    dot: { r: 2 },
    activeDot: { r: 4 }
  },
  sm: { 
    strokeWidth: 2, 
    dot: { r: 3 },
    activeDot: { r: 6 }
  },
  md: { 
    strokeWidth: 3, 
    dot: { r: 4 },
    activeDot: { r: 8 }
  },
  base: { 
    strokeWidth: 3, 
    dot: { r: 4 },
    activeDot: { r: 8 }
  }
};

/**
 * 计算基于数据长度的X轴间隔
 */
export function calculateChartInterval(dataLength: number, breakpoint: Breakpoint): number {
  if (dataLength <= 10) return 0;
  
  switch(breakpoint) {
    case 'xs':
      return Math.max(1, Math.floor(dataLength / 5));
    case 'sm':
      return Math.max(1, Math.floor(dataLength / 8));
    case 'md':
      return Math.max(1, Math.floor(dataLength / 10));
    case 'lg':
      return Math.max(1, Math.floor(dataLength / 15));
    case 'xl':
    case '2xl':
      return Math.max(1, Math.floor(dataLength / 20));
    default:
      return Math.max(1, Math.floor(dataLength / 10));
  }
}

/**
 * 计算基于数据长度的图表底部边距
 */
export function calculateChartBottomMargin(dataLength: number, breakpoint: Breakpoint): number {
  if (dataLength <= 5) return 50;
  if (dataLength <= 10) return 60;
  
  switch(breakpoint) {
    case 'xs':
      return 80;
    case 'sm':
      return 90;
    case 'md':
    case 'lg':
    case 'xl':
    case '2xl':
      return 100;
    default:
      return 80;
  }
} 