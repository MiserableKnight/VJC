/**
 * 日期配置
 * 处理日期格式化和显示相关的配置
 */

import { DATA_DISPLAY_CONFIG } from './app';
import { getChinaTime } from '../utils/dateUtils';

/**
 * 判断是否应该显示今天的数据
 * 根据当前时间判断是否已经超过今天的数据显示时间点
 * 
 * @returns 是否应该显示今天的数据
 */
export function shouldShowTodayData(): boolean {
  const chinaTime = getChinaTime();
  const currentHour = chinaTime.getHours();
  
  // 如果当前小时大于等于配置的显示时间，则显示今天的数据
  return currentHour >= DATA_DISPLAY_CONFIG.TODAY_DATA_DISPLAY_HOUR;
}

/**
 * 获取日期格式化选项
 * 
 * @returns 日期格式化选项
 */
export const DATE_FORMAT_OPTIONS = {
  // 短日期格式：YYYY-MM-DD
  SHORT: DATA_DISPLAY_CONFIG.DATE_FORMAT,
  
  // 长日期格式：YYYY-MM-DD HH:mm:ss
  LONG: `${DATA_DISPLAY_CONFIG.DATE_FORMAT} ${DATA_DISPLAY_CONFIG.TIME_FORMAT}`,
  
  // 数据库日期格式：YYYY/MM/DD
  DATABASE: 'YYYY/MM/DD',
  
  // 显示日期格式：MM月DD日
  DISPLAY: 'MM月DD日',
  
  // 年月格式：YYYY年MM月
  YEAR_MONTH: 'YYYY年MM月',
}; 