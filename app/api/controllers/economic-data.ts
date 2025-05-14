import db from '../../database';
import { testConnection } from '../../database/connection';
import { successResponse, errorResponse } from '../../lib/api-utils';
import { getTodayFormatted, normalizeDate } from '../../utils/dateUtils';

/**
 * 获取经济性数据
 */
export async function getEconomicData() {
  try {
    console.log('开始查询经济性数据（从leg_data表）');
    
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('数据库连接测试失败');
      return errorResponse('数据库连接失败', 500);
    }
    
    console.log('数据库连接测试成功，开始获取航段数据作为经济性数据');
    
    // 从leg_data表获取数据作为经济性数据源
    const allLegData = await db.getLegData();
    console.log(`获取到航段数据记录数: ${allLegData.length}`);
    
    // 获取今天的日期
    const today = getTodayFormatted().replace(/\//g, '-');
    console.log(`今天的日期: ${today}`);
    
    // 记录所有可用的日期，便于调试
    const availableDates = new Set<string>();
    allLegData.forEach(leg => {
      const normalizedDate = normalizeDate(leg.date).replace(/\//g, '-');
      availableDates.add(normalizedDate);
    });
    console.log(`数据库中可用的日期: ${Array.from(availableDates).join(', ')}`);
    
    // 筛选今天的数据
    const todayLegData = allLegData.filter(leg => {
      const legDate = normalizeDate(leg.date).replace(/\//g, '-');
      return legDate === today;
    });
    
    console.log(`今天的航段数据记录数: ${todayLegData.length}`);
    
    // 将航段数据转换为经济性数据格式
    let economicData = todayLegData.map(leg => {
      // 使用leg_data中的油量字段
      // 只有当OUT和IN数据都有时才计算空地油耗
      const groundFuelConsumption = (leg.out_fuel_kg !== undefined && leg.out_fuel_kg !== null && leg.out_fuel_kg !== 0 && 
                                    leg.in_fuel_kg !== undefined && leg.in_fuel_kg !== null && leg.in_fuel_kg !== 0) 
                                    ? leg.out_fuel_kg - leg.in_fuel_kg 
                                    : undefined;
      
      // 只有当OFF和ON数据都有时才计算空中油耗
      const airFuelConsumption = (leg.off_fuel_kg !== undefined && leg.off_fuel_kg !== null && leg.off_fuel_kg !== 0 && 
                                leg.on_fuel_kg !== undefined && leg.on_fuel_kg !== null && leg.on_fuel_kg !== 0) 
                                ? leg.off_fuel_kg - leg.on_fuel_kg 
                                : undefined;
      
      return {
        date: leg.date,
        operating_aircraft: leg.operating_aircraft,
        msn: leg.msn,
        flight_number: leg.flight_number,
        departure_airport: leg.departure_airport,
        arrival_airport: leg.arrival_airport,
        out_time: leg.out_time,
        out_fuel_kg: leg.out_fuel_kg,
        off_fuel_kg: leg.off_fuel_kg,
        on_fuel_kg: leg.on_fuel_kg,
        in_fuel_kg: leg.in_fuel_kg,
        ground_fuel_consumption: groundFuelConsumption,
        air_fuel_consumption: airFuelConsumption
      };
    });
    
    // 按照out_time（推出时间）排序，保持与飞机运行状态表一致的排序
    economicData = economicData.sort((a, b) => {
      // 如果推出时间为空，则排在后面
      if (!a.out_time) return 1;
      if (!b.out_time) return -1;
      
      // 将时间格式转换为可比较的格式
      return a.out_time.localeCompare(b.out_time);
    });
    
    console.log(`处理后的今日经济性数据记录数: ${economicData.length}`);
    
    return successResponse({
      economicData: economicData
    });
  } catch (error) {
    console.error('经济性数据查询错误', error);
    
    let errorMessage = '经济性数据查询失败';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}，请联系管理员检查`;
    }
    
    return errorResponse(errorMessage, 500);
  }
} 