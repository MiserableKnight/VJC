import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// 数据库配置类型定义
interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
  table_name: string;
}

// 从环境变量获取数据库配置
const dbConfig: DbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  schema: process.env.DB_SCHEMA || "public",
  table_name: process.env.DB_TABLE || "op_data"
};

// 日志中不输出完整连接信息，以保护敏感数据
console.log('正在连接数据库...');

// 创建连接池实例，使用环境变量的SSL配置
const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  }
});

export async function GET() {
  try {
    console.log('开始查询数据库');
    
    // 测试连接
    try {
      const testConnection = await pool.query('SELECT NOW()');
      console.log('数据库连接测试成功');
    } catch (connError) {
      console.error('数据库连接测试失败');
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

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

    // 安全处理表名和模式名
    const schemaName = dbConfig.schema;
    const tableName = dbConfig.table_name;
    
    // 先获取表中的一行数据，检查数据结构
    const sampleDataQuery = `
      SELECT * FROM "${schemaName}"."${tableName}"
      LIMIT 1
    `;
    
    let sampleData;
    try {
      const sampleDataResult = await pool.query(sampleDataQuery);
      sampleData = sampleDataResult.rows[0];
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
    const dailyQuery = `
      SELECT * FROM "${schemaName}"."${tableName}"
      WHERE "date" ${dateCondition} $1
      ORDER BY "date"
    `;
    const dailyResult = await pool.query(dailyQuery, [formattedTodayForDb]);
    console.log(`获取到历史数据记录`);

    // 获取最近一个日期（用于提示信息）
    let latestDate = null;
    if (dailyResult.rows.length > 0) {
      // 对日期排序以找到最新日期
      const sortedDates = [...dailyResult.rows].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      latestDate = sortedDates[0].date;
      console.log('最新历史数据日期:', latestDate);
    }

    // 获取累计数据 - 使用正确的列名格式（使用下划线而不是空格）
    const cumulativeQuery = `
      SELECT 
        "date",
        "cumulative_air_time" as air_time,
        "cumulative_block_time" as block_time,
        "cumulative_fc" as fc,
        "cumulative_flight_leg" as flight_leg,
        "cumulative_daily_utilization_air_time",
        "cumulative_daily_utilization_blcok_time"
      FROM "${schemaName}"."${tableName}"
      WHERE "date" ${dateCondition} $1
      ORDER BY "date"
    `;
    const cumulativeResult = await pool.query(cumulativeQuery, [formattedTodayForDb]);
    console.log(`获取到累计数据记录`);

    return NextResponse.json({
      daily: dailyResult.rows,
      cumulative: cumulativeResult.rows,
      isLatestDay: true,
      latestDate: latestDate,
      sampleData: sampleData,
      includeToday: shouldIncludeToday
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