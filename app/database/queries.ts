import { getSupabaseClient } from './connection';
import { getOperationalDataTableName, getFleetDataTableName, getLegDataTableName, getEconomicDataTableName } from './config';
import { FlightData, AircraftData, LegData, EconomicData } from './models';
import { 
  getChinaTime, 
  formatDateSlash, 
  normalizeDate, 
  shouldShowTodayData, 
  getTodayFormatted
} from '../utils/dateUtils';

/**
 * 格式化日期，确保统一格式
 */
function formatDateForComparison(date: string): string {
  return normalizeDate(date);
}

/**
 * 获取日期数据进行调试
 */
function logDateInfo(rows: any[]): void {
  console.log('数据集中的日期:');
  if (rows.length === 0) {
    console.log('  数据集为空');
    return;
  }
  
  const dateSet = new Set<string>();
  rows.forEach(row => {
    const date = formatDateForComparison(row.date);
    dateSet.add(date);
  });
  
  const sortedDates = Array.from(dateSet).sort();
  sortedDates.forEach(date => {
    console.log(`  ${date}`);
  });
}

/**
 * 获取每日数据
 * @param dateCondition 日期条件（<=, >=, =）
 * @param formattedDate 格式化的日期字符串
 * @returns 每日数据数组
 */
export async function getDailyData(dateCondition: string, formattedDate: string): Promise<Partial<FlightData>[]> {
  console.log('使用Supabase客户端查询每日数据');
  
  try {
    const tableName = getOperationalDataTableName();
    const supabaseClient = getSupabaseClient();
    
    let query = supabaseClient
      .from(tableName)
      .select(`
        date,
        air_time,
        block_time,
        fc,
        flight_leg,
        daily_utilization_air_time,
        daily_utilization_block_time
      `);

    // 根据日期条件设置过滤器
    if (dateCondition === '<=') {
      query = query.lte('date', formattedDate);
    } else if (dateCondition === '>=') {
      query = query.gte('date', formattedDate);
    } else if (dateCondition === '=') {
      query = query.eq('date', formattedDate);
    }
    
    query = query.order('date', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase查询失败:', error);
      return [];
    }
    
    // 打印数据集中的日期信息
    console.log('Supabase原始每日数据日期信息:');
    logDateInfo(data || []);
    
    // 获取当前中国时间
    const chinaTime = getChinaTime();
    console.log(`Supabase DB: 中国时区时间: ${chinaTime.toISOString()}, 小时: ${chinaTime.getHours()}`);
    
    // 获取今天的格式化日期
    const todayFormatted = getTodayFormatted();
    
    // 使用统一函数判断是否显示今天数据
    const shouldIncludeToday = shouldShowTodayData();
    
    console.log(`Supabase数据过滤: 当前日期=${todayFormatted}, 当前小时=${chinaTime.getHours()}, 应包含今天数据=${shouldIncludeToday}`);
    console.log(`Supabase查询返回记录数: ${data?.length || 0}`);
    
    // 如果不到21点，过滤掉当天的数据
    if (!shouldIncludeToday && data) {
      const filteredRows = data.filter(row => {
        const rowDate = formatDateForComparison(row.date);
        const todayNormalized = normalizeDate(todayFormatted);
        const isRowToday = rowDate === todayNormalized;
        if (isRowToday) {
          console.log(`过滤掉今天的记录: ${row.date} (标准化后: ${rowDate})`);
        }
        return !isRowToday;
      });
      
      console.log(`Supabase过滤后记录数: ${filteredRows.length}`);
      console.log('Supabase过滤后数据日期信息:');
      logDateInfo(filteredRows);
      return filteredRows;
    }
    
    return data || [];
  } catch (error) {
    console.error('使用Supabase获取每日数据失败:', error);
    return [];
  }
}

/**
 * 获取累计数据
 * @param dateCondition 日期条件（<=, >=, =）
 * @param formattedDate 格式化的日期字符串
 * @returns 累计数据数组
 */
export async function getCumulativeData(dateCondition: string, formattedDate: string): Promise<Partial<FlightData>[]> {
  console.log('使用Supabase客户端查询累计数据');
  
  try {
    const tableName = getOperationalDataTableName();
    const supabaseClient = getSupabaseClient();
    
    let query = supabaseClient
      .from(tableName)
      .select(`
        date,
        cumulative_air_time,
        cumulative_block_time,
        cumulative_fc,
        cumulative_flight_leg,
        cumulative_daily_utilization_air_time,
        cumulative_daily_utilization_block_time
      `);

    // 根据日期条件设置过滤器
    if (dateCondition === '<=') {
      query = query.lte('date', formattedDate);
    } else if (dateCondition === '>=') {
      query = query.gte('date', formattedDate);
    } else if (dateCondition === '=') {
      query = query.eq('date', formattedDate);
    }
    
    query = query.order('date', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase累计数据查询失败:', error);
      return [];
    }
    
    // 打印数据集中的日期信息
    console.log('Supabase原始累计数据日期信息:');
    logDateInfo(data || []);
    
    // 获取当前中国时间
    const chinaTime = getChinaTime();
    console.log(`Supabase累计DB: 中国时区时间: ${chinaTime.toISOString()}, 小时: ${chinaTime.getHours()}`);
    
    // 获取今天的格式化日期
    const todayFormatted = getTodayFormatted();
    
    // 使用统一函数判断是否显示今天数据
    const shouldIncludeToday = shouldShowTodayData();
    
    console.log(`Supabase累计数据过滤: 当前日期=${todayFormatted}, 当前小时=${chinaTime.getHours()}, 应包含今天数据=${shouldIncludeToday}`);
    console.log(`Supabase累计查询返回记录数: ${data?.length || 0}`);
    
    // 如果不到21点，过滤掉当天的数据
    if (!shouldIncludeToday && data) {
      const filteredRows = data.filter(row => {
        const rowDate = formatDateForComparison(row.date);
        const todayNormalized = normalizeDate(todayFormatted);
        const isRowToday = rowDate === todayNormalized;
        if (isRowToday) {
          console.log(`过滤掉今天的累计记录: ${row.date} (标准化后: ${rowDate})`);
        }
        return !isRowToday;
      });
      
      console.log(`Supabase累计过滤后记录数: ${filteredRows.length}`);
      console.log('Supabase过滤后累计数据日期信息:');
      logDateInfo(filteredRows);
      return filteredRows;
    }
    
    return data || [];
  } catch (error) {
    console.error('使用Supabase获取累计数据失败:', error);
    return [];
  }
}

/**
 * 获取数据样例
 * @returns 数据样例
 */
export async function getSampleData(): Promise<any> {
  console.log('使用Supabase客户端获取数据样例');
  
  try {
    const tableName = getOperationalDataTableName();
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase获取数据样例失败:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('使用Supabase获取数据样例失败:', error);
    return null;
  }
}

/**
 * 获取最新日期
 * @param rows 数据行数组
 * @returns 最新日期
 */
export function getLatestDate(rows: any[]): string | null {
  if (!rows || rows.length === 0) return null;
  
  // 对日期排序以找到最新日期
  const sortedDates = [...rows].sort((a, b) => {
    // 使用normalizeDate确保日期格式一致，然后进行比较
    const dateA = new Date(normalizeDate(a.date).replace(/\//g, '-'));
    const dateB = new Date(normalizeDate(b.date).replace(/\//g, '-'));
    return dateB.getTime() - dateA.getTime();
  });
  
  // 返回最新日期，保持原始格式
  return sortedDates[0].date;
}

/**
 * 获取机队数据
 * @returns 机队数据数组
 */
export async function getFleetData(): Promise<AircraftData[]> {
  console.log('使用Supabase客户端获取机队数据');
  
  try {
    const tableName = getFleetDataTableName();
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .order('registration');
    
    if (error) {
      console.error('Supabase获取机队数据失败:', error);
      return [];
    }
    
    console.log(`Supabase查询返回机队记录数: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error('使用Supabase获取机队数据失败:', error);
    return [];
  }
}

/**
 * 获取航段数据
 * @returns 航段数据数组
 */
export async function getLegData(): Promise<LegData[]> {
  console.log('使用Supabase客户端获取航段数据');
  
  try {
    const tableName = getLegDataTableName();
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Supabase获取航段数据失败:', error);
      return [];
    }
    
    console.log(`Supabase查询返回航段记录数: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error('使用Supabase获取航段数据失败:', error);
    return [];
  }
}

/**
 * 获取经济性数据
 * @returns 经济性数据数组
 */
export async function getEconomicData(): Promise<EconomicData[]> {
  console.log('使用Supabase客户端获取经济性数据');
  
  try {
    const tableName = getEconomicDataTableName();
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Supabase获取经济性数据失败:', error);
      return [];
    }
    
    console.log(`Supabase查询返回经济性数据记录数: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error('使用Supabase获取经济性数据失败:', error);
    return [];
  }
}

// 导出默认对象
export default {
  getDailyData,
  getCumulativeData,
  getSampleData,
  getLatestDate,
  getFleetData,
  getLegData,
  getEconomicData
}; 