import { DbConfig } from './models';
import { ENV, hasRequiredEnv } from '../config/env';

/**
 * 读取Supabase配置
 * @returns Supabase URL和密钥
 */
function loadSupabaseConfig(): {url: string | null, key: string | null} {
  if (ENV.SUPABASE_URL && ENV.SUPABASE_KEY) {
    console.log('从环境变量中读取Supabase配置');
    return { url: ENV.SUPABASE_URL, key: ENV.SUPABASE_KEY };
  }
  
  return { url: null, key: null };
}

/**
 * 检查数据库配置是否存在
 * @returns 配置是否存在
 */
export function hasDbConfig(): boolean {
  return hasRequiredEnv();
}

/**
 * 获取数据库配置
 * @returns 数据库配置对象
 */
export function getDbConfig(): DbConfig {
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
      table_name: ENV.DB_OP_DATA_TABLE,
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey
    };
  }
  
  throw new Error('未配置Memfire数据库连接信息，请检查环境变量');
}

/**
 * 获取数据表名
 * @returns 操作数据表名
 */
export function getOperationalDataTableName(): string {
  return ENV.DB_OP_DATA_TABLE;
}

/**
 * 获取机队数据表名
 * @returns 机队数据表名
 */
export function getFleetDataTableName(): string {
  return ENV.DB_FLEET_TABLE;
} 