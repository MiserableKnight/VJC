import { Pool, PoolClient } from 'pg';

// 数据库配置类型定义
export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
  table_name: string;
}

// 从环境变量获取数据库配置
export const getDbConfig = (): DbConfig => ({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  schema: process.env.DB_SCHEMA || "public",
  table_name: process.env.DB_TABLE || "op_data"
});

// 创建单例连接池
const dbConfig = getDbConfig();
const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  }
});

// 数据模型接口
export interface FlightData {
  date: string;
  air_time?: number;
  block_time?: number;
  fc?: number;
  flight_leg?: number;
  daily_utilization_air_time?: number;
  daily_utilization_block_time?: number;
  cumulative_air_time?: number;
  cumulative_block_time?: number;
  cumulative_fc?: number;
  cumulative_flight_leg?: number;
  cumulative_daily_utilization_air_time?: number;
  cumulative_daily_utilization_block_time?: number;
}

// 格式化日期，确保统一格式
function formatDateForComparison(date: string): string {
  // 标准化日期格式为YYYY/MM/DD
  let formattedDate = String(date);
  // 如果是YYYY-MM-DD格式，转换为YYYY/MM/DD
  if (formattedDate.includes('-')) {
    formattedDate = formattedDate.replace(/-/g, '/');
  }
  return formattedDate;
}

// 获取日期数据进行调试
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

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

// 获取每日数据
export async function getDailyData(dateCondition: string, formattedDate: string): Promise<any[]> {
  const config = getDbConfig();
  const schemaName = config.schema;
  const tableName = config.table_name;
  
  const query = `
    SELECT 
      "date",
      "air_time",
      "block_time",
      "fc",
      "flight_leg",
      "daily_utilization_air_time",
      "daily_utilization_block_time"
    FROM "${schemaName}"."${tableName}"
    WHERE "date" ${dateCondition} $1
    ORDER BY "date"
  `;
  
  try {
    const result = await pool.query(query, [formattedDate]);
    
    // 打印数据集中的日期信息
    console.log('原始每日数据日期信息:');
    logDateInfo(result.rows);
    
    // 检查是否需要过滤掉当天的数据
    const today = new Date();
    console.log(`DB: 原始服务器时间: ${today.toISOString()}, 小时: ${today.getHours()}`);
    
    // 获取中国时区的时间
    const options = { timeZone: 'Asia/Shanghai' };
    const chinaTime = new Date(today.toLocaleString('en-US', options));
    console.log(`DB: 中国时区时间: ${chinaTime.toISOString()}, 小时: ${chinaTime.getHours()}`);
    
    // 获取年月日
    const year = chinaTime.getFullYear();
    const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getDate()).padStart(2, '0');
    // 格式化为YYYY/MM/DD
    const todayFormatted = `${year}/${month}/${day}`;
    
    const currentHour = chinaTime.getHours();
    const shouldIncludeToday = currentHour >= 21;
    
    console.log(`数据过滤: 当前日期=${todayFormatted}, 当前小时=${currentHour}, 应包含今天数据=${shouldIncludeToday}`);
    console.log(`查询返回记录数: ${result.rows.length}`);
    
    // 如果不到21点，过滤掉当天的数据
    if (!shouldIncludeToday) {
      const filteredRows = result.rows.filter(row => {
        // 使用格式化函数处理日期
        const rowDate = formatDateForComparison(row.date);
        const isToday = rowDate === todayFormatted;
        if (isToday) {
          console.log(`过滤掉今天的记录: ${rowDate}`);
        }
        return !isToday;
      });
      
      console.log(`过滤后记录数: ${filteredRows.length}`);
      console.log('过滤后数据日期信息:');
      logDateInfo(filteredRows);
      return filteredRows;
    }
    
    return result.rows;
  } catch (error) {
    console.error('获取每日数据失败:', error);
    throw error;
  }
}

// 获取累计数据
export async function getCumulativeData(dateCondition: string, formattedDate: string): Promise<any[]> {
  const config = getDbConfig();
  const schemaName = config.schema;
  const tableName = config.table_name;
  
  const query = `
    SELECT 
      "date",
      "cumulative_air_time",
      "cumulative_block_time",
      "cumulative_fc",
      "cumulative_flight_leg",
      "cumulative_daily_utilization_air_time",
      "cumulative_daily_utilization_block_time"
    FROM "${schemaName}"."${tableName}"
    WHERE "date" ${dateCondition} $1
    ORDER BY "date"
  `;
  
  try {
    const result = await pool.query(query, [formattedDate]);
    
    // 打印数据集中的日期信息
    console.log('原始累计数据日期信息:');
    logDateInfo(result.rows);
    
    // 检查是否需要过滤掉当天的数据
    const today = new Date();
    console.log(`累计DB: 原始服务器时间: ${today.toISOString()}, 小时: ${today.getHours()}`);
    
    // 获取中国时区的时间
    const options = { timeZone: 'Asia/Shanghai' };
    const chinaTime = new Date(today.toLocaleString('en-US', options));
    console.log(`累计DB: 中国时区时间: ${chinaTime.toISOString()}, 小时: ${chinaTime.getHours()}`);
    
    // 获取年月日
    const year = chinaTime.getFullYear();
    const month = String(chinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getDate()).padStart(2, '0');
    // 格式化为YYYY/MM/DD
    const todayFormatted = `${year}/${month}/${day}`;
    
    const currentHour = chinaTime.getHours();
    const shouldIncludeToday = currentHour >= 21;
    
    console.log(`累计数据过滤: 当前日期=${todayFormatted}, 当前小时=${currentHour}, 应包含今天数据=${shouldIncludeToday}`);
    console.log(`累计查询返回记录数: ${result.rows.length}`);
    
    // 如果不到21点，过滤掉当天的数据
    if (!shouldIncludeToday) {
      const filteredRows = result.rows.filter(row => {
        // 使用格式化函数处理日期
        const rowDate = formatDateForComparison(row.date);
        const isToday = rowDate === todayFormatted;
        if (isToday) {
          console.log(`过滤掉今天的累计记录: ${rowDate}`);
        }
        return !isToday;
      });
      
      console.log(`累计过滤后记录数: ${filteredRows.length}`);
      console.log('过滤后累计数据日期信息:');
      logDateInfo(filteredRows);
      return filteredRows;
    }
    
    return result.rows;
  } catch (error) {
    console.error('获取累计数据失败:', error);
    throw error;
  }
}

// 获取数据样例
export async function getSampleData(): Promise<any> {
  const config = getDbConfig();
  const schemaName = config.schema;
  const tableName = config.table_name;
  
  const query = `
    SELECT * FROM "${schemaName}"."${tableName}"
    LIMIT 1
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('获取数据样例失败:', error);
    throw error;
  }
}

// 获取最新日期
export async function getLatestDate(rows: any[]): Promise<string | null> {
  if (!rows || rows.length === 0) return null;
  
  // 对日期排序以找到最新日期
  const sortedDates = [...rows].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return sortedDates[0].date;
}

// 关闭数据库连接池（在应用关闭时调用）
export async function closePool(): Promise<void> {
  await pool.end();
}

export default {
  testConnection,
  getDailyData,
  getCumulativeData,
  getSampleData,
  getLatestDate,
  closePool
}; 