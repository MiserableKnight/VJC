import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('天气API请求开始处理');
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    
    console.log(`请求参数: latitude=${latitude}, longitude=${longitude}`);
    
    if (!latitude || !longitude) {
      console.log('缺少必要参数');
      return NextResponse.json(
        { error: '缺少必要参数：latitude 和 longitude' }, 
        { status: 400 }
      );
    }
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&forecast_days=1`;
    
    console.log(`请求外部API: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(url, { 
      signal: controller.signal,
      cache: 'no-store' // 禁用缓存，确保获取最新数据
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`天气API响应错误: ${response.status}`);
      throw new Error(`天气API响应状态：${response.status}`);
    }
    
    const data = await response.json();
    console.log('天气API响应成功');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('获取天气数据错误:', error);
    return NextResponse.json(
      { error: '获取天气数据失败', message: error instanceof Error ? error.message : '未知错误' }, 
      { status: 500 }
    );
  }
} 