/**
 * 类型安全的环境变量访问
 * 集中管理所有环境变量，提供类型安全的访问方式
 */

/**
 * 环境变量配置接口
 */
export interface EnvConfig {
  // Supabase配置
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  
  // 数据库配置
  DB_SCHEMA: string;
  DB_OP_DATA_TABLE: string;
  DB_FLEET_TABLE: string;
  DB_LEG_DATA_TABLE: string;
  DB_ECONOMIC_DATA_TABLE: string;
  DB_TECH_STATUS_TABLE: string;
  
  // API配置
  GRAPHQL_URL: string;
  API_KEY: string;
  
  // 应用配置
  NODE_ENV: string;
  IS_PRODUCTION: boolean;
}

/**
 * 环境变量配置
 */
export const ENV: EnvConfig = {
  // Supabase配置
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_ANON_KEY || '',
  
  // 数据库配置
  DB_SCHEMA: process.env.DB_SCHEMA || 'public',
  DB_OP_DATA_TABLE: process.env.DB_OP_DATA_TABLE || 'op_data',
  DB_FLEET_TABLE: process.env.DB_FLEET_TABLE || 'fleet_data',
  DB_LEG_DATA_TABLE: process.env.DB_LEG_DATA_TABLE || 'leg_data',
  DB_ECONOMIC_DATA_TABLE: process.env.DB_ECONOMIC_DATA_TABLE || 'economic_data',
  DB_TECH_STATUS_TABLE: process.env.DB_TECH_STATUS_TABLE || 'tech_status_data',
  
  // API配置
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
  API_KEY: process.env.API_KEY || '',
  
  // 应用配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

/**
 * 检查必要的环境变量是否已配置
 * @returns 环境变量是否已正确配置
 */
export function hasRequiredEnv(): boolean {
  return !!ENV.SUPABASE_URL && !!ENV.SUPABASE_KEY;
}

/**
 * 获取环境名称
 * @returns 当前环境名称
 */
export function getEnvironmentName(): string {
  return ENV.NODE_ENV;
}

/**
 * 是否为生产环境
 * @returns 是否为生产环境
 */
export function isProduction(): boolean {
  return ENV.IS_PRODUCTION;
} 