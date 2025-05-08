import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import db, { getDbConfig } from '../../lib/db';

export async function GET(request: NextRequest) {
  // 验证请求
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.API_KEY;
  
  // 如果设置了API密钥，则验证请求头
  if (apiKey && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey)) {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    console.log('开始查询数据库');
    
    // 测试连接
    const isConnected = await db.testConnection();
    if (!isConnected) {
      console.error('数据库连接测试失败');
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }
    console.log('数据库连接测试成功');

    // 获取当前日期格式化为字符串 (YYYY-MM-DD)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    console.log('今天日期格式化前:', formattedToday);
    
    // 转换为YYYY/MM/DD格式，与数据库格式保持一致
    const formattedTodayForDb = formattedToday.replace(/-/g, '/');
    console.log('今天日期格式化后(数据库格式):', formattedTodayForDb);

    // 判断是否已经超过当天21:00
    const currentHour = today.getHours();
    const shouldIncludeToday = currentHour >= 21;
    console.log(`当前小时: ${currentHour}, 是否包含今天数据: ${shouldIncludeToday}`);

    // 先获取表中的一行数据，检查数据结构
    let sampleData;
    try {
      sampleData = await db.getSampleData();
      console.log('获取到数据样例');
    } catch (tableError: any) {
      console.error('表访问失败', tableError);
      return NextResponse.json(
        { error: `无法访问数据表` },
        { status: 500 }
      );
    }

    // 根据时间确定日期条件
    const dateCondition = shouldIncludeToday ? '<=' : '<';

    // 获取历史数据（如果是21点后，包括今天；否则只包括历史）
    const dailyData = await db.getDailyData(dateCondition, formattedTodayForDb);
    console.log(`获取到历史数据记录`);

    // 获取最近一个日期（用于提示信息）
    let latestDate = null;
    if (dailyData.length > 0) {
      latestDate = await db.getLatestDate(dailyData);
      console.log('最新历史数据日期:', latestDate);
    }

    // 获取累计数据
    const cumulativeData = await db.getCumulativeData(dateCondition, formattedTodayForDb);
    console.log(`获取到累计数据记录`);

    // 判断是否应该告诉前端是最新一天
    // 确保前端提示信息的准确性
    const frontendIsLatestDay = shouldIncludeToday;
    
    // 验证当前数据是否包含今天
    const hasTodayData = frontendIsLatestDay && latestDate === formattedTodayForDb.replace(/\//g, '-');
    console.log(`前端显示最新提示: ${frontendIsLatestDay}, 包含今天数据: ${hasTodayData}, 最新日期: ${latestDate}`);

    return NextResponse.json({
      daily: dailyData,
      cumulative: cumulativeData,
      isLatestDay: frontendIsLatestDay,
      latestDate: latestDate,
      sampleData: sampleData,
      includeToday: frontendIsLatestDay
    });
  } catch (error) {
    console.error('数据库查询错误', error);
    
    // 更详细的错误信息，但不暴露具体的技术细节
    let errorMessage = '数据库连接或查询失败';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}，请联系管理员检查`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 