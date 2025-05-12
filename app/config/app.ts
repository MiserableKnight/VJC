/**
 * 应用配置
 * 集中管理应用中使用的常量
 */

/**
 * 刷新设置
 */
export const REFRESH_CONFIG = {
  // 自动刷新间隔（毫秒）
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5分钟
  
  // 最小刷新间隔（毫秒）
  MIN_REFRESH_INTERVAL: 30 * 1000, // 30秒
  
  // 最后刷新时间本地存储键名
  LAST_REFRESH_KEY: 'vjc_last_refresh_time',
  
  // 自动刷新开关本地存储键名
  AUTO_REFRESH_ENABLED_KEY: 'vjc_auto_refresh_enabled',
};

/**
 * 数据显示设置
 */
export const DATA_DISPLAY_CONFIG = {
  // 今日数据显示时间（小时，24小时制）
  // 在此时间之后才显示今天的数据
  TODAY_DATA_DISPLAY_HOUR: 21,
  
  // 日期格式
  DATE_FORMAT: 'YYYY-MM-DD',
  
  // 时间格式
  TIME_FORMAT: 'HH:mm:ss',
  
  // 数据精度（小数位数）
  DECIMAL_PRECISION: 2,
};

/**
 * API设置
 */
export const API_CONFIG = {
  // API请求超时（毫秒）
  TIMEOUT: 30 * 1000, // 30秒
  
  // API重试次数
  RETRY_COUNT: 3,
  
  // API重试间隔（毫秒）
  RETRY_INTERVAL: 1000, // 1秒
};

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  // 用户设置
  USER_SETTINGS: 'vjc_user_settings',
  
  // 主题设置
  THEME: 'vjc_theme',
  
  // 语言设置
  LANGUAGE: 'vjc_language',
};

/**
 * 默认设置
 */
export const DEFAULT_CONFIG = {
  // 默认主题
  THEME: 'light',
  
  // 默认语言
  LANGUAGE: 'zh-CN',
}; 