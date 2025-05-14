import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] 每日天气API请求开始处理');
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const days = searchParams.get('days') || '5';
    
    console.log(`[API] 请求参数: latitude=${latitude}, longitude=${longitude}, days=${days}`);
    
    if (!latitude || !longitude) {
      console.log('[API] 缺少必要参数');
      return NextResponse.json(
        { 
          error: '缺少必要参数：latitude 和 longitude',
          message: '请提供有效的经纬度参数',
          success: false
        }, 
        { status: 400 }
      );
    }
    
    // 验证经纬度是否为有效数值
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const daysNum = parseInt(days);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.log('[API] 无效的经纬度参数');
      return NextResponse.json(
        { 
          error: '无效的经纬度参数',
          message: '请提供有效范围内的经纬度值',
          success: false
        }, 
        { status: 400 }
      );
    }
    
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 16) {
      console.log('[API] 无效的天数参数');
      return NextResponse.json(
        { 
          error: '无效的天数参数',
          message: '天数必须在1-16之间',
          success: false
        }, 
        { status: 400 }
      );
    }
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max,wind_direction_10m_dominant&forecast_days=${days}`;
    
    console.log(`[API] 请求外部API: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时，与主API一致
    
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        cache: 'no-store', // 禁用缓存，确保获取最新数据
        headers: {
          'User-Agent': 'VJC Weather App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '无法读取错误响应');
        console.error(`[API] 每日天气API响应错误: 状态=${response.status}, 响应=${errorText}`);
        return NextResponse.json(
          { 
            error: `每日天气API响应错误 (${response.status})`, 
            details: errorText,
            message: '外部天气服务返回错误，请稍后再试',
            success: false 
          }, 
          { status: response.status }
        );
      }
      
      const data = await response.json();
      
      // 验证数据结构
      if (!data.daily || !data.daily.time) {
        console.error('[API] 每日天气API返回了不完整的数据结构:', data);
        return NextResponse.json(
          { 
            error: '每日天气API返回了不完整的数据结构', 
            details: data,
            message: '天气数据格式不正确，请联系管理员',
            success: false
          }, 
          { status: 500 }
        );
      }
      
      console.log(`[API] 每日天气API响应成功，包含 ${data.daily.time.length} 天数据`);
      return NextResponse.json({
        ...data,
        success: true
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[API] 每日天气请求超时');
        return NextResponse.json(
          { 
            error: '获取每日天气数据超时', 
            message: '请求超时，请稍后再试',
            code: 'TIMEOUT',
            success: false
          }, 
          { status: 504 }
        );
      }
      
      throw fetchError; // 重新抛出以便被外层 catch 捕获
    }
    
  } catch (error: any) {
    console.error('[API] 获取每日天气数据错误:', error);
    
    // 检查是否为网络错误
    const isNetworkError = error instanceof Error && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('ENOTFOUND') || 
      error.message.includes('network') ||
      error.message.includes('fetch')
    );
    
    const status = isNetworkError ? 503 : 500;
    const errorMessage = isNetworkError 
      ? '网络连接错误，无法访问天气服务' 
      : '获取每日天气数据失败';
    
    const userMessage = isNetworkError
      ? '连接天气服务失败，请检查您的网络连接'
      : '服务器处理请求时出错，请稍后再试';
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        message: userMessage,
        details: error instanceof Error ? error.message : '未知错误',
        isNetworkError,
        success: false,
        code: isNetworkError ? 'NETWORK_ERROR' : 'SERVER_ERROR'
      }, 
      { status }
    );
  }
} 