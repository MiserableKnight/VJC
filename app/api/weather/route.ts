import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: '缺少必要参数：latitude 和 longitude' }, 
        { status: 400 }
      );
    }
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code&forecast_days=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`天气API响应状态：${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('获取天气数据错误:', error);
    return NextResponse.json(
      { error: '获取天气数据失败' }, 
      { status: 500 }
    );
  }
} 