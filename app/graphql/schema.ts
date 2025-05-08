import 'reflect-metadata';
import { ObjectType, Field, ID, Float, Int, buildSchemaSync, Query, Resolver } from 'type-graphql';
import db, { DbConfig, getDbConfig } from '../lib/db';

// 数据库配置
const dbConfig: DbConfig = getDbConfig();

@ObjectType({ description: "图表数据项" })
export class ChartDataItem {
  @Field(() => ID)
  date!: string;

  @Field(() => Float, { nullable: true, description: "每日飞行时间" })
  daily_air_time?: number;

  @Field(() => Float, { nullable: true, description: "每日轮挡时间" })
  daily_block_time?: number;

  @Field(() => Int, { nullable: true, description: "每日飞行循环" })
  daily_fc?: number;

  @Field(() => Int, { nullable: true, description: "每日飞行航段" })
  daily_flight_leg?: number;

  @Field(() => Float, { nullable: true, description: "每日利用率(飞行)" })
  daily_utilization_air_time?: number;

  @Field(() => Float, { nullable: true, description: "每日利用率(轮挡)" })
  daily_utilization_block_time?: number;

  @Field(() => Float, { nullable: true, description: "累计飞行时间" })
  cumulative_air_time?: number;

  @Field(() => Float, { nullable: true, description: "累计轮挡时间" })
  cumulative_block_time?: number;

  @Field(() => Int, { nullable: true, description: "累计飞行循环" })
  cumulative_fc?: number;

  @Field(() => Int, { nullable: true, description: "累计飞行航段" })
  cumulative_flight_leg?: number;

  @Field(() => Float, { nullable: true, description: "累计每日利用率(飞行)" })
  cumulative_daily_utilization_air_time?: number;

  @Field(() => Float, { nullable: true, description: "累计每日利用率(轮挡)" })
  cumulative_daily_utilization_block_time?: number;
}

@ObjectType({ description: "API响应数据" })
export class ChartDataResponse {
  @Field(() => [ChartDataItem], { description: "合并后的图表数据" })
  combinedData!: ChartDataItem[];

  @Field(() => Boolean, { description: "是否为最新一天的数据" })
  isLatestDay!: boolean;

  @Field(() => String, { nullable: true, description: "最新数据的日期" })
  latestDate?: string;
}

// 安全处理表名和模式名
const schemaName = dbConfig.schema;
const tableName = dbConfig.table_name;

// 辅助函数：安全获取对象属性
const safeGetProperty = (obj: any, key: string, defaultValue: any = null) => {
  if (!obj) return defaultValue;
  const value = obj[key];
  // 确保数字类型字段在数据库中为null时，GraphQL返回null而不是0
  if (value === null && (typeof defaultValue === 'number' || defaultValue === null)) return null;
  return value !== undefined ? value : defaultValue;
};

@ObjectType()
class DataPoint {
    @Field()
    date!: string;

    @Field({ nullable: true })
    air_time?: number;

    @Field({ nullable: true })
    block_time?: number;

    @Field({ nullable: true })
    fc?: number;

    @Field({ nullable: true })
    flight_leg?: number;

    @Field({ nullable: true })
    daily_utilization_air_time?: number;

    @Field({ nullable: true })
    daily_utilization_block_time?: number;

    @Field({ nullable: true })
    cumulative_air_time?: number;

    @Field({ nullable: true })
    cumulative_block_time?: number;

    @Field({ nullable: true })
    cumulative_fc?: number;

    @Field({ nullable: true })
    cumulative_flight_leg?: number;

    @Field({ nullable: true })
    cumulative_daily_utilization_air_time?: number;

    @Field({ nullable: true })
    cumulative_daily_utilization_block_time?: number; 
}

// GraphQL 查询的 Resolver
@Resolver()
export class ChartDataResolver {
  @Query(() => ChartDataResponse, { description: "获取图表所需的所有数据" })
  async chartData(): Promise<ChartDataResponse> { // 方法名修改为chartData，与Query名称一致
    console.log('GraphQL: 开始查询数据库');
    
    // 创建日期对象并明确设置为中国时区
    const today = new Date();
    console.log(`GraphQL: 原始服务器时间: ${today.toISOString()}, 小时: ${today.getHours()}`);
    
    // 获取中国时区的时间
    const options = { timeZone: 'Asia/Shanghai' };
    const chinaTime = new Date(today.toLocaleString('en-US', options));
    console.log(`GraphQL: 中国时区时间: ${chinaTime.toISOString()}, 小时: ${chinaTime.getHours()}`);
    
    const formattedTodayForDb = chinaTime.toISOString().split('T')[0].replace(/-/g, '/');
    const currentHour = chinaTime.getHours();
    const shouldIncludeToday = currentHour >= 21;
    console.log(`GraphQL: 当前中国时区小时: ${currentHour}, 包含今天数据: ${shouldIncludeToday}`);
    const dateCondition = shouldIncludeToday ? '<=' : '<';

    // 使用数据库访问层获取数据
    const dailyResult = { rows: await db.getDailyData(dateCondition, formattedTodayForDb) };
    const cumulativeResult = { rows: await db.getCumulativeData(dateCondition, formattedTodayForDb) };
    
    console.log('GraphQL: 数据库查询完成');
    // 打印最后一个数据点的日期，用于调试
    if (dailyResult.rows.length > 0) {
      const lastDataPoint = dailyResult.rows[dailyResult.rows.length - 1];
      console.log(`GraphQL: 最后一个数据点日期: ${lastDataPoint.date}`);
    }

    const dataMap: Record<string, Partial<ChartDataItem>> = {};

    dailyResult.rows.forEach((item: any) => {
      const date = item.date;
      if (!dataMap[date]) dataMap[date] = { date };
      dataMap[date].daily_air_time = safeGetProperty(item, 'air_time');
      dataMap[date].daily_block_time = safeGetProperty(item, 'block_time');
      dataMap[date].daily_fc = safeGetProperty(item, 'fc');
      dataMap[date].daily_flight_leg = safeGetProperty(item, 'flight_leg');
      dataMap[date].daily_utilization_air_time = safeGetProperty(item, 'daily_utilization_air_time');
      dataMap[date].daily_utilization_block_time = safeGetProperty(item, 'daily_utilization_block_time');
    });

    cumulativeResult.rows.forEach((item: any) => {
      const date = item.date;
      if (!dataMap[date]) dataMap[date] = { date };
      dataMap[date].cumulative_air_time = safeGetProperty(item, 'cumulative_air_time');
      dataMap[date].cumulative_block_time = safeGetProperty(item, 'cumulative_block_time');
      dataMap[date].cumulative_fc = safeGetProperty(item, 'cumulative_fc');
      dataMap[date].cumulative_flight_leg = safeGetProperty(item, 'cumulative_flight_leg');
      dataMap[date].cumulative_daily_utilization_air_time = safeGetProperty(item, 'cumulative_daily_utilization_air_time');
      dataMap[date].cumulative_daily_utilization_block_time = safeGetProperty(item, 'cumulative_daily_utilization_block_time');
    });

    const combinedData = Object.values(dataMap)
      .map(item => item as ChartDataItem)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let latestDate: string | undefined = undefined;
    if (combinedData.length > 0) {
      latestDate = combinedData[combinedData.length - 1].date;
    }
    
    console.log(`GraphQL: 数据合并完成, 共 ${combinedData.length} 条记录`);

    return {
      combinedData,
      isLatestDay: shouldIncludeToday,
      latestDate,
    };
  }
}

// 构建Schema
export const schema = buildSchemaSync({
  resolvers: [ChartDataResolver],
  validate: false, // 可根据需要开启
}); 