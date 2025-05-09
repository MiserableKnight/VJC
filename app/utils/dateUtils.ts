/**
 * 日期和时区工具函数
 */

/**
 * 获取中国时区的当前时间
 * 使用UTC+8计算，避免依赖系统时区设置
 */
export function getChinaTime(): Date {
  const now = new Date();
  // 中国时区是UTC+8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 8));
}

/**
 * 格式化日期为YYYY/MM/DD格式
 */
export function formatDateSlash(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 格式化日期为YYYY-MM-DD格式
 */
export function formatDateDash(date: Date): string {
  return formatDateSlash(date).replace(/\//g, '-');
}

/**
 * 统一日期格式为比较，无论输入格式如何
 */
export function normalizeDate(date: string): string {
  // 去除可能的时间部分
  const datePart = date.split('T')[0];
  // 替换所有分隔符为统一格式
  return datePart.replace(/[-\/]/g, '/');
}

/**
 * 判断是否应该显示当天数据（21点规则）
 */
export function shouldShowTodayData(): boolean {
  const chinaTime = getChinaTime();
  return chinaTime.getHours() >= 21;
}

/**
 * 获取当前中国日期的格式化字符串(YYYY/MM/DD)
 */
export function getTodayFormatted(): string {
  return formatDateSlash(getChinaTime());
}

/**
 * 检查给定日期是否是今天
 */
export function isToday(dateStr: string): boolean {
  const normalizedDate = normalizeDate(dateStr);
  const normalizedToday = normalizeDate(getTodayFormatted());
  return normalizedDate === normalizedToday;
} 