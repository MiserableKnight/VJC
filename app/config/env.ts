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
  SUPABASE_ANON_KEY: string;
  
  // 数据库配置
  DB_SCHEMA: string;
  DB_OP_TABLE: string;
  DB_FLEET_TABLE: string;
  DB_LEG_TABLE: string;
  DB_ECONOMIC_TABLE: string;
  DB_TECH_STATUS_TABLE: string;
  DB_USAGE_STATUS_TABLE: string;
  
  // API配置
  GRAPHQL_URL: string;
  API_KEY: string;
  
  // 应用配置
  NODE_ENV: string;
  IS_PRODUCTION: boolean;
}

// 获取正确的表名，兼容多种可能的环境变量
function getTableName(mainEnvVar: string | undefined, fallbackName: string, alternativeEnvVars: string[] = []): string {
  // 检查主要环境变量
  if (mainEnvVar && mainEnvVar.trim() !== '') {
    console.log(`使用主要环境变量设置表名: ${mainEnvVar}`);
    return mainEnvVar;
  }
  
  // 检查替代环境变量
  for (const envVar of alternativeEnvVars) {
    const value = process.env[envVar];
    if (value && value.trim() !== '') {
      console.log(`使用替代环境变量 ${envVar} 设置表名: ${value}`);
      return value;
    }
  }
  
  // 使用默认值
  console.log(`未找到环境变量设置，使用默认表名: ${fallbackName}`);
  return fallbackName;
}

// 尝试获取Supabase密钥，按优先级顺序
function getSupabaseKey(): string {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anonKey) return anonKey;
  
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY;
  if (key) return key;
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) return serviceKey;
  
  return '';
}

/**
 * 环境变量配置
 */
export const ENV: EnvConfig = {
  // Supabase配置
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: getSupabaseKey(),
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  
  // 数据库配置
  DB_SCHEMA: process.env.DB_SCHEMA || 'public',
  DB_OP_TABLE: getTableName(
    process.env.DB_OP_TABLE, 
    'op_data', 
    ['DB_OP_DATA_TABLE', 'DB_OPERATIONAL_DATA_TABLE']
  ),
  DB_FLEET_TABLE: getTableName(
    process.env.DB_FLEET_TABLE,
    'fleet_data',
    ['DB_AIRCRAFT_TABLE']
  ),
  DB_LEG_TABLE: getTableName(
    process.env.DB_LEG_TABLE,
    'leg_data',
    ['DB_LEGS_TABLE', 'DB_FLIGHT_LEG_TABLE']
  ),
  DB_ECONOMIC_TABLE: getTableName(
    process.env.DB_ECONOMIC_TABLE,
    'economic_data',
    ['DB_ECONOMICS_TABLE']
  ),
  DB_TECH_STATUS_TABLE: getTableName(
    process.env.DB_TECH_STATUS_TABLE,
    'tech_status_data',
    ['DB_TECHNICAL_STATUS_TABLE']
  ),
  DB_USAGE_STATUS_TABLE: getTableName(
    process.env.DB_USAGE_STATUS_TABLE,
    'usage_status',
    ['DB_AIRCRAFT_USAGE_TABLE']
  ),
  
  // API配置
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
  API_KEY: process.env.API_KEY || '',
  
  // 应用配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

/**
 * 打印当前环境配置
 */
export function logEnvironmentConfig(): void {
  console.log('当前环境配置:');
  console.log(`- 环境: ${ENV.NODE_ENV}`);
  console.log(`- Supabase URL: ${ENV.SUPABASE_URL ? '已配置' : '未配置'}`);
  console.log(`- Supabase Key: ${ENV.SUPABASE_KEY ? '已配置' : '未配置'}`);
  console.log(`- Supabase Anon Key: ${ENV.SUPABASE_ANON_KEY ? '已配置' : '未配置'}`);
  console.log(`- 数据库Schema: ${ENV.DB_SCHEMA}`);
  console.log(`- 操作数据表: ${ENV.DB_OP_TABLE}`);
  console.log(`- 机队数据表: ${ENV.DB_FLEET_TABLE}`);
  console.log(`- 技术状态表: ${ENV.DB_TECH_STATUS_TABLE}`);
  console.log(`- 使用状态表: ${ENV.DB_USAGE_STATUS_TABLE}`);
}

/**
 * 检查必要的环境变量是否已配置
 * @returns 环境变量是否已正确配置
 */
export function hasRequiredEnv(): boolean {
  // 检查是否有URL和任意一种密钥
  return !!ENV.SUPABASE_URL && (!!ENV.SUPABASE_KEY || !!ENV.SUPABASE_ANON_KEY);
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