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

/**
 * 航段数据接口
 */
export interface LegData {
  date: string;                    // 日期
  operating_aircraft: string;      // 飞机注册号
  msn: string;                     // 制造序列号
  flight_number: string;           // 航班号
  departure_airport: string;       // 起飞机场
  arrival_airport: string;         // 降落机场
  out_time: string;                // 推出时间
  off_time: string;                // 起飞时间
  on_time: string;                 // 落地时间
  in_time: string;                 // 到位时间
  out_fuel_kg?: number;            // 推出时油量(kg)
  off_fuel_kg?: number;            // 起飞时油量(kg)
  on_fuel_kg?: number;             // 落地时油量(kg)
  in_fuel_kg?: number;             // 到位时油量(kg)
}

/**
 * 经济性数据接口
 */
export interface EconomicData {
  date: string;                    // 日期
  operating_aircraft: string;      // 飞机注册号
  msn: string;                     // 制造序列号
  flight_number: string;           // 航班号
  departure_airport: string;       // 起飞机场
  arrival_airport: string;         // 降落机场
  out_fuel_kg: number;             // OUT油量(kg)
  off_fuel_kg: number;             // OFF油量(kg)
  on_fuel_kg: number;              // ON油量(kg)
  in_fuel_kg: number;              // IN油量(kg)
  ground_fuel_consumption?: number; // 空地油耗（计算值：OUT油量-IN油量）
  air_fuel_consumption?: number;    // 空中油耗（计算值：OFF油量-ON油量）
} 