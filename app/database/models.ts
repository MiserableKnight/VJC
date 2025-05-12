// app/database/models.ts

/**
 * 数据库配置接口
 */
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

/**
 * 飞行数据接口
 */
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

/**
 * 飞机数据接口
 */
export interface AircraftData {
  id: string;
  registration: string;
  msn: string;
  type?: string;
  delivery_date?: string;
  status?: string;
} 