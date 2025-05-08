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
}

// 从环境变量获取数据库配置
export function getDbConfig(): DbConfig {
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "", // 在实际生产中，确保密码安全管理
    schema: process.env.DB_SCHEMA || "public",
    table_name: process.env.DB_TABLE || "op_data"
  };
} 