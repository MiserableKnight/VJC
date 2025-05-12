import { NextResponse } from 'next/server';
import { testConnection } from '../../database/connection';
import { hasDbConfig } from '../../database/config';
import { ENV, getEnvironmentName } from '../../config/env';

export async function GET() {
  try {
    // 检查环境变量是否已配置
    const dbConfigured = hasDbConfig();
    
    if (!dbConfigured) {
      throw new Error('未配置Memfire数据库连接信息');
    }
    
    // 尝试连接数据库
    const startTime = Date.now();
    
    // 使用数据库模块的测试连接功能
    console.log('使用数据库模块进行健康检查');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('数据库连接测试失败');
    }
    
    const duration = Date.now() - startTime;

    // 返回健康检查结果
    return NextResponse.json({
      status: 'ok',
      database: true,
      dbConfigured: true,
      environment: getEnvironmentName(),
      time: new Date().toISOString(),
      responseTime: `${duration}ms`,
      message: 'Memfire数据库连接正常'
    });
  } catch (error) {
    console.error('健康检查失败 - 数据库连接错误', error);
    
    // 检查环境变量是否已配置
    const dbConfigured = hasDbConfig();
    
    // 返回错误状态，但不泄露具体错误信息
    return NextResponse.json({
      status: 'error',
      database: false,
      dbConfigured: dbConfigured,
      environment: getEnvironmentName(),
      message: '数据库连接失败，请检查配置'
    }, { status: 500 });
  }
} 