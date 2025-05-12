import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 从环境变量读取Supabase配置
function loadSupabaseConfig(): {url: string | null, key: string | null} {
  // 从环境变量中读取配置
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    console.log('从环境变量中读取Supabase配置 (健康检查)');
    return { url: envUrl, key: envKey };
  }
  
  return { url: null, key: null };
}

// 创建Supabase客户端（如果配置有效）
const { url: supabaseUrl, key: supabaseKey } = loadSupabaseConfig();
let supabaseClient: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase客户端初始化成功 (健康检查)');
  } catch (error) {
    console.error('Supabase客户端初始化失败 (健康检查):', error);
  }
} else {
  console.error('未找到Supabase配置信息 (健康检查)');
}

export async function GET() {
  try {
    // 检查环境变量是否已配置
    const dbConfigured = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) || supabaseClient !== null;
    
    if (!dbConfigured) {
      throw new Error('未配置Memfire数据库连接信息');
    }
    
    if (!supabaseClient) {
      throw new Error('Supabase客户端初始化失败');
    }
    
    // 尝试连接数据库
    const startTime = Date.now();
    
    // 使用Supabase客户端进行健康检查
    console.log('使用Supabase客户端进行健康检查');
    const tableName = process.env.DB_OP_DATA_TABLE || 'op_data';
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('date')
      .limit(1);
    
    if (error) throw error;
    
    const duration = Date.now() - startTime;

    // 返回健康检查结果
    return NextResponse.json({
      status: 'ok',
      database: true,
      dbConfigured: true,
      time: new Date().toISOString(),
      responseTime: `${duration}ms`,
      message: 'Memfire数据库连接正常'
    });
  } catch (error) {
    console.error('健康检查失败 - 数据库连接错误', error);
    
    // 检查环境变量是否已配置
    const dbConfigured = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) || supabaseClient !== null;
    
    // 返回错误状态，但不泄露具体错误信息
    return NextResponse.json({
      status: 'error',
      database: false,
      dbConfigured: dbConfigured,
      message: '数据库连接失败，请检查配置'
    }, { status: 500 });
  }
} 