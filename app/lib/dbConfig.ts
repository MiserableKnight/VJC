// app/lib/dbConfig.ts

// 数据库配置类型定义
export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
  table_name: string;
  // Supabase配置
  supabase_url?: string;
  supabase_key?: string;
}

// 读取Supabase配置
function loadSupabaseConfig(): {url: string | null, key: string | null} {
  // 从环境变量中读取配置
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    console.log('从环境变量中读取Supabase配置');
    return { url: envUrl, key: envKey };
  }
  
  return { url: null, key: null };
}

// 获取数据库配置
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
      schema: process.env.DB_SCHEMA || 'public',
      table_name: process.env.DB_OP_DATA_TABLE || 'op_data',
      supabase_url: supabaseUrl,
      supabase_key: supabaseKey
    };
  }
  
  throw new Error('未配置Memfire数据库连接信息，请检查环境变量');
} 