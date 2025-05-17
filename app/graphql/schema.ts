import 'reflect-metadata';
import { ObjectType, Field, ID, Float, Int, buildSchemaSync, Query, Resolver, Arg } from 'type-graphql';
import db from '../database';
import { getDbConfig } from '../database/config';
import { DbConfig } from '../database/models';
import { AircraftResolver, AircraftFailureResolver } from './resolvers';

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

  @Field(() => Float, { nullable: true, description: "故障千时率" })
  failure_rate_per_1000_hours?: number;
  
  @Field(() => Float, { nullable: true, description: "签派可靠度" })
  dispatch_reliability?: number;
  
  @Field(() => Float, { nullable: true, description: "SDR千时率" })
  sdr_rate_per_1000_hours?: number;
  
  @Field(() => Float, { nullable: true, description: "可用率" })
  availability_rate?: number;
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

@ObjectType({ description: "飞机数据" })
export class AircraftData {
  @Field(() => ID)
  id!: string;

  @Field()
  registration!: string;

  @Field()
  msn!: string;
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
    
    // 获取技术状态数据、机队数据和使用状态数据
    const techStatusData = await db.getTechStatusData();
    const fleetData = await db.getFleetData();
    const usageStatusData = await db.getUsageStatusData();
    
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
      
      // 计算整个机队的故障千时率 = 1000 × (故障次数) / 飞行小时(空中)
      const dateObj = new Date(date.replace(/\//g, '-'));
      
      // 计算截至该日期的故障总数（只统计故障级别大于1的故障）
      const failureCount = techStatusData.filter(status => {
        const statusDate = new Date(status.日期.replace(/\//g, '-'));
        return statusDate <= dateObj && (status.故障级别 ? status.故障级别 > 1 : false);
      }).length;
      
      // 获取累计飞行小时
      const cumulativeAirTime = dataMap[date].cumulative_air_time || 0;
      
      // 计算故障千时率，如果累计飞行小时为0，则设置为0
      if (cumulativeAirTime > 0) {
        dataMap[date].failure_rate_per_1000_hours = parseFloat(((1000 * failureCount) / cumulativeAirTime).toFixed(2));
      } else {
        dataMap[date].failure_rate_per_1000_hours = 0;
      }
      
      // 计算签派可靠度：100*（当日累计飞行循环FC-（tech_status_data"备注"中的描述是"延误"+"取消"）/当日累计飞行循环
      const cumulativeFC = dataMap[date].cumulative_fc || 0;
      if (cumulativeFC > 0) {
        const delayedOrCancelledCount = techStatusData.filter(status => {
          const statusDate = new Date(status.日期.replace(/\//g, '-'));
          return statusDate <= dateObj && status.备注 && (status.备注.includes('延误') || status.备注.includes('取消'));
        }).length;
        
        // 计算签派可靠度
        const reliability = 100 * (cumulativeFC - delayedOrCancelledCount) / cumulativeFC;
        dataMap[date].dispatch_reliability = parseFloat(reliability.toFixed(2));
      } else {
        dataMap[date].dispatch_reliability = 100; // 如果没有飞行循环，则设置为100%
      }
      
      // 计算SDR千时率：1000×SDR次数/飞行小时（空中）
      if (cumulativeAirTime > 0) {
        // 计算截至该日期的SDR次数（统计是否SDR为"是"的记录）
        const sdrCount = techStatusData.filter(status => {
          const statusDate = new Date(status.日期.replace(/\//g, '-'));
          return statusDate <= dateObj && status.是否SDR === true;
        }).length;
        
        // 计算SDR千时率
        dataMap[date].sdr_rate_per_1000_hours = parseFloat(((1000 * sdrCount) / cumulativeAirTime).toFixed(2));
      } else {
        dataMap[date].sdr_rate_per_1000_hours = 0; // 如果没有飞行小时，则设置为0
      }
      
      // 计算可用率 = （可用架日×100）/在用架日
      // 可用架日 = 统计当天所有MSN列中值为"执行航班"的列数量
      // 在用架日 = fleet_data中的MSN列中总共有几个唯一的飞机序列号
      
      // 获取当天的日期字符串
      const dateStr = date.replace(/\//g, '-');
      
      // 找到当天的使用状态记录
      const todayUsageRecord = usageStatusData.find(status => 
        status.日期.replace(/\//g, '-') === dateStr
      );
      
      // 初始化可用架日
      let availableAircraftDays = 0;
      
      // 如果有当天的记录，检查各个飞机的使用状态
      if (todayUsageRecord) {
        // 遍历所有属性，查找MSN对应的状态
        for (const key in todayUsageRecord) {
          // 跳过非MSN字段
          if (['id', '日期', '注册号'].includes(key)) continue;
          
          // 检查使用状态是否为"执行航班"
          if (todayUsageRecord[key] === '执行航班') {
            availableAircraftDays++;
          }
        }
      }
      
      // 计算在用架日（机队中唯一MSN的数量）
      const uniqueMSNs = new Set();
      fleetData.forEach(aircraft => {
        // 尝试获取msn（小写或大写）
        const msn = aircraft.msn || aircraft.MSN;
        if (msn) {
          uniqueMSNs.add(msn);
        }
      });
      const totalAircraftCount = uniqueMSNs.size;
      
      console.log(`日期: ${date}, 唯一MSN数量: ${totalAircraftCount}, 可用架日: ${availableAircraftDays}`);
      
      if (totalAircraftCount > 0) {
        // 计算可用率
        const availabilityRate = (availableAircraftDays * 100) / totalAircraftCount;
        dataMap[date].availability_rate = parseFloat(availabilityRate.toFixed(2));
      } else {
        dataMap[date].availability_rate = 0; // 如果没有飞机，则设置为0
      }
      
      // 可以在此处为每架飞机单独计算故障千时率
      // 如果需要在前端展示单架机的数据，可以在GraphQL schema中添加相应字段
      // 或者创建专门的查询和解析器
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

  @Query(() => [AircraftData], { description: "获取机队所有飞机数据" })
  async getAllAircraft(): Promise<AircraftData[]> {
    console.log('GraphQL: 开始查询机队数据');
    
    try {
      const aircraftData = await db.getFleetData();
      
      return aircraftData.map((aircraft: any) => ({
        id: aircraft.id || aircraft.registration,
        registration: aircraft.registration,
        msn: aircraft.msn
      }));
    } catch (error) {
      console.error('获取机队数据失败:', error);
      throw new Error('Failed to fetch aircraft data');
    }
  }
}

// 修改 schema 导出方式，完全内存中构建，不保存到文件
export const schema = buildSchemaSync({
  resolvers: [ChartDataResolver, AircraftResolver, AircraftFailureResolver],
  // 不要输出到文件系统
  emitSchemaFile: false,
  // 自动验证输入数据
  validate: true,
}); 