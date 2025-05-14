import db from '../../database';
import { testConnection } from '../../database/connection';
import { successResponse, errorResponse } from '../../lib/api-utils';
import { getTodayFormatted } from '../../utils/dateUtils';

/**
 * 获取航段数据
 */
export async function getLegData() {
  try {
    console.log('开始查询航段数据');
    
    // 测试数据库连接
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('数据库连接测试失败');
      return errorResponse('数据库连接失败', 500);
    }
    
    console.log('数据库连接测试成功，开始获取航段数据');
    
    // 获取航段数据
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
    
    return successResponse({
      legData: todayLegData
    });
  } catch (error) {
    console.error('航段数据查询错误', error);
    
    let errorMessage = '航段数据查询失败';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}，请联系管理员检查`;
    }
    
    return errorResponse(errorMessage, 500);
  }
} 