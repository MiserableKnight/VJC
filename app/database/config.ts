import { DbConfig } from './models';
import { ENV, hasRequiredEnv } from '../config/env';

/**
 * 读取Supabase配置
 * @returns Supabase URL和密钥
 */
function loadSupabaseConfig(): {url: string | null, key: string | null} {
  console.log('正在检查Supabase配置');
  console.log(`SUPABASE_URL是否存在: ${!!ENV.SUPABASE_URL}`);
  
  // Supabase主要使用anon key
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (ENV.SUPABASE_URL && anonKey) {
    console.log('使用Supabase anon key');
    return { url: ENV.SUPABASE_URL, key: anonKey };
  }
  
  // 如果找不到anon key，尝试其他密钥
  if (ENV.SUPABASE_URL) {
    console.log('尝试查找其他Supabase密钥...');
    // 按优先级尝试不同的密钥
    const possibleKeys = [
      process.env.NEXT_PUBLIC_SUPABASE_KEY || null,
      process.env.SUPABASE_KEY || null,
      process.env.SUPABASE_SERVICE_ROLE_KEY || null
    ];
    
    for (let i = 0; i < possibleKeys.length; i++) {
      if (possibleKeys[i]) {
        console.log(`找到替代密钥 #${i+1}`);
        return { url: ENV.SUPABASE_URL, key: possibleKeys[i] };
      }
    }
  }
  
  console.log('未找到有效的Supabase配置');
  return { url: null, key: null };
}

/**
 * 检查数据库配置是否存在
 * @returns 配置是否存在
 */
export function hasDbConfig(): boolean {
  const { url, key } = loadSupabaseConfig();
  const hasConfig = !!url && !!key;
  console.log(`数据库配置检查结果: ${hasConfig ? '存在' : '不存在'}`);
  return hasConfig;
}

/**
 * 获取数据库配置
 * @returns 数据库配置对象
 */
export function getDbConfig(): DbConfig {
  console.log('正在获取数据库配置...');
  
  // 读取Supabase配置
  const { url: supabaseUrl, key: supabaseKey } = loadSupabaseConfig();
  
  // 使用Memfire数据库配置
  if (supabaseUrl && supabaseKey) {
    console.log('使用Memfire数据库配置');
    // 从URL提取主机名
    const urlObj = new URL(supabaseUrl);
    const host = urlObj.hostname;
    
    return {
      host,
      port: 5432, // Supabase PostgreSQL默认端口
      database: 'postgres', // Supabase默认数据库名
      user: 'postgres', // 使用Supabase默认用户名
      password: supabaseKey, // 使用Supabase密钥作为密码
      schema: ENV.DB_SCHEMA,
      table_name: ENV.DB_OP_TABLE,
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey
    };
  }
  
  // 如果在开发环境中并且启用了模拟数据模式，则返回模拟配置
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_DATA === 'true') {
    console.log('使用模拟数据配置');
    return {
      host: 'mock',
      port: 0,
      database: 'mock',
      user: 'mock',
      password: 'mock',
      schema: 'public',
      table_name: 'mock_table',
      supabase_url: 'https://mock-url.com',
      supabase_key: 'mock-key'
    };
  }
  
  console.error('缺少Memfire数据库连接信息，环境变量检查:');
  console.error(`- SUPABASE_URL: ${ENV.SUPABASE_URL ? '存在' : '不存在'}`);
  console.error(`- SUPABASE_KEY: ${ENV.SUPABASE_KEY ? '存在' : '不存在'}`);
  console.error(`- SUPABASE_ANON_KEY: ${ENV.SUPABASE_ANON_KEY ? '存在' : '不存在'}`);
  console.error(`- DB_SCHEMA: ${ENV.DB_SCHEMA}`);
  
  throw new Error('未配置Memfire数据库连接信息，请检查环境变量SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * 获取数据表名
 * @returns 操作数据表名
 */
export function getOperationalDataTableName(): string {
  const tableName = ENV.DB_OP_TABLE;
  console.log(`使用操作数据表: ${tableName}`);
  return tableName;
}

/**
 * 获取机队数据表名
 * @returns 机队数据表名
 */
export function getFleetDataTableName(): string {
  return ENV.DB_FLEET_TABLE;
}

/**
 * 获取航段数据表名
 * @returns 航段数据表名
 */
export function getLegDataTableName(): string {
  return ENV.DB_LEG_TABLE;
}

/**
 * 获取经济性数据表名
 * @returns 经济性数据表名
 */
export function getEconomicDataTableName(): string {
  return ENV.DB_ECONOMIC_TABLE;
}

/**
 * 获取技术状态数据表名
 * @returns 技术状态数据表名
 */
export function getTechStatusDataTableName(): string {
  return ENV.DB_TECH_STATUS_TABLE || 'tech_status_data';
}

/**
 * 获取使用状态数据表名
 * @returns 使用状态数据表名
 */
export function getUsageStatusTableName(): string {
  return ENV.DB_USAGE_STATUS_TABLE || 'usage_status';
} 