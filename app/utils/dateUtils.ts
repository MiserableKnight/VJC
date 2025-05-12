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

/**
 * 判断是否处于运营时间（北京时间7:45-22:00）
 */
export function isOperationalHours(): boolean {
  const chinaTime = getChinaTime();
  const hours = chinaTime.getHours();
  const minutes = chinaTime.getMinutes();
  
  // 转换为分钟表示，方便比较
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = 7 * 60 + 45; // 7:45
  const endMinutes = 22 * 60;       // 22:00
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * 获取当前日期，格式化为显示用的格式（DD MMM YYYY）
 */
export function getTodayForDisplay(): string {
  const chinaTime = getChinaTime();
  const day = String(chinaTime.getDate()).padStart(2, '0');
  const month = chinaTime.toLocaleString('en-US', { month: 'short' });
  const year = chinaTime.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * 比较两个日期字符串是否为同一天
 */
export function isSameDay(date1: string, date2: string): boolean {
  // 首先标准化日期格式
  const normalizedDate1 = normalizeDate(date1);
  const normalizedDate2 = normalizeDate(date2);
  
  // 如果格式化后的日期字符串相同，则为同一天
  if (normalizedDate1 === normalizedDate2) {
    return true;
  }
  
  // 对于不同格式的日期，尝试解析并比较年月日
  try {
    // 尝试解析日期
    const d1Parts = date1.split(/[-\/ ]/);
    const d2Parts = date2.split(/[-\/ ]/);
    
    // 如果是"DD MMM YYYY"格式（如"10 May 2023"）
    if (date1.match(/^\d{1,2} [A-Za-z]{3} \d{4}$/)) {
      const months = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
      const d1 = new Date(parseInt(d1Parts[2]), months[d1Parts[1] as keyof typeof months], parseInt(d1Parts[0]));
      
      // 检查第二个日期的格式
      if (date2.match(/^\d{1,2} [A-Za-z]{3} \d{4}$/)) {
        const d2 = new Date(parseInt(d2Parts[2]), months[d2Parts[1] as keyof typeof months], parseInt(d2Parts[0]));
        return d1.getFullYear() === d2.getFullYear() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getDate() === d2.getDate();
      } else {
        // 假设第二个日期是YYYY/MM/DD或YYYY-MM-DD格式
        const d2 = new Date(parseInt(d2Parts[0]), parseInt(d2Parts[1])-1, parseInt(d2Parts[2]));
        return d1.getFullYear() === d2.getFullYear() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getDate() === d2.getDate();
      }
    }
    
    // 默认情况，尝试标准解析
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  } catch (e) {
    console.error('日期比较错误:', e);
    return false;
  }
} 