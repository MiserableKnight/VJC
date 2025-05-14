import db from '../../database';
import { testConnection } from '../../database/connection';
import { successResponse, errorResponse } from '../../lib/api-utils';
import { getTodayFormatted } from '../../utils/dateUtils';

/**
 * 获取经济性数据
 */
export async function getEconomicData() {
  try {
    console.log('开始查询经济性数据（从航段数据）');
    
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('数据库连接测试失败');
      return errorResponse('数据库连接失败', 500);
    }
    
    console.log('数据库连接测试成功，开始获取航段数据作为经济性数据来源');
    
    // 获取航段数据作为经济性数据源
    const allLegData = await db.getLegData();
    console.log(`获取到航段数据记录数: ${allLegData.length}`);
    
    // 获取今天的日期
    const today = getTodayFormatted().replace(/\//g, '-');
    console.log(`今天的日期: ${today}`);
    
    // 筛选今天的数据
    const todayLegData = allLegData.filter(leg => {
      const legDate = leg.date.replace(/\//g, '-');
      return legDate === today;
    });
    
    console.log(`今天的航段数据记录数: ${todayLegData.length}`);
    
    // 模拟经济性数据（从航段数据转换）
    const economicData = todayLegData.map(leg => ({
      date: leg.date,
      operating_aircraft: leg.operating_aircraft,
      msn: leg.msn,
      flight_number: leg.flight_number,
      departure_airport: leg.departure_airport,
      arrival_airport: leg.arrival_airport,
      out_fuel: Math.floor(Math.random() * 1000) + 5000, // 模拟数据
      off_fuel: Math.floor(Math.random() * 800) + 4500,
      on_fuel: Math.floor(Math.random() * 500) + 2000,
      in_fuel: Math.floor(Math.random() * 300) + 1800,
      ground_fuel_consumption: 0, // 将在前端计算
      air_fuel_consumption: 0 // 将在前端计算
    }));
    
    // 计算油耗
    const processedData = economicData.map(item => {
      const groundFuelConsumption = item.out_fuel - item.in_fuel;
      const airFuelConsumption = item.off_fuel - item.on_fuel;
      
      return {
        ...item,
        ground_fuel_consumption: groundFuelConsumption,
        air_fuel_consumption: airFuelConsumption
      };
    });
    
    console.log(`生成的今日经济性数据记录数: ${processedData.length}`);
    
    return successResponse({
      economicData: processedData
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