import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDbConfig } from './config';
import { ENV } from '../config/env';
import { getOperationalDataTableName } from './config';

/**
 * 创建并获取Supabase客户端单例
 */
class SupabaseConnection {
  private static instance: SupabaseConnection;
  private client: SupabaseClient | null = null;
  
  private constructor() {
    this.initialize();
  }
  
  /**
   * 获取SupabaseConnection单例
   */
  public static getInstance(): SupabaseConnection {
    if (!SupabaseConnection.instance) {
      SupabaseConnection.instance = new SupabaseConnection();
    }
    return SupabaseConnection.instance;
  }
  
  /**
   * 初始化Supabase客户端
   */
  private initialize(): void {
    try {
      const dbConfig = getDbConfig();
      
      if (!dbConfig.supabase_url || !dbConfig.supabase_key) {
        throw new Error('未配置Supabase连接信息');
      }
      
      this.client = createClient(dbConfig.supabase_url, dbConfig.supabase_key);
      console.log('Supabase客户端初始化成功');
    } catch (error) {
      console.error('Supabase客户端初始化失败:', error);
      throw new Error('Supabase客户端初始化失败');
    }
  }
  
  /**
   * 获取Supabase客户端
   */
  public getClient(): SupabaseClient {
    if (!this.client) {
      this.initialize();
      if (!this.client) {
        throw new Error('无法创建Supabase客户端');
      }
    }
    return this.client;
  }
  
  /**
   * 测试数据库连接
   */
  public async testConnection(): Promise<boolean> {
    try {
      const tableName = getOperationalDataTableName();
      const { data, error } = await this.getClient()
        .from(tableName)
        .select('date')
        .limit(1);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('数据库连接测试失败:', error);
      return false;
    }
  }
}

/**
 * 获取Supabase客户端
 * @returns Supabase客户端实例
 */
export function getSupabaseClient(): SupabaseClient {
  return SupabaseConnection.getInstance().getClient();
}

/**
 * 测试数据库连接
 * @returns 连接是否成功
 */
export async function testConnection(): Promise<boolean> {
  return await SupabaseConnection.getInstance().testConnection();
}

// 导出默认实例
export default {
  getClient: getSupabaseClient,
  testConnection
}; 