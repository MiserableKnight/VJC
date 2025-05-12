import { NextResponse } from 'next/server';
import { getVJCAircraftData, AircraftInfo } from '../../services/opensky';

// 飞机ICAO24地址
const VJC_AIRCRAFT_ICAO24 = {
  B652G: '781cf2', // B-652G（COMAC ARJ21-700）
  B656E: '7820a2'  // B-656E（COMAC ARJ21-700）
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icao24 = searchParams.get('icao24')?.toLowerCase();
  const isVjc = searchParams.get('vjc') === 'true';
  
  // 如果指定了vjc=true参数，则获取VJC飞机数据
  if (isVjc) {
    try {
      const vjcAircraftData = await getVJCAircraftData();
      
      const hasData = vjcAircraftData.B652G !== null || vjcAircraftData.B656E !== null;
      
      if (hasData) {
        return NextResponse.json(vjcAircraftData);
      } else {
        return NextResponse.json(
          { message: '目前未能获取到飞机数据，可能飞机不在追踪范围内或OpenSky API暂时不可用' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('OpenSky API 错误:', error);
      return NextResponse.json({ error: '获取飞机数据失败' }, { status: 500 });
    }
  }
  
  // 单个飞机查询模式
  if (!icao24) {
    return NextResponse.json({ error: '需要提供ICAO24参数或使用vjc=true参数' }, { status: 400 });
  }
  
  try {
    // 使用服务中的getAircraftState函数获取单个飞机数据
    // 由于getAircraftState是模块内部函数，我们需要重新实现类似逻辑
    const url = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    
    // 请求配置
    const requestOptions: RequestInit = {};
    const OPENSKY_CREDENTIALS = {
      username: 'MiserableKnight',
      password: 'p8Sr4rJqmtg7BN!'
    };
    
    // 添加认证头
    const auth = Buffer.from(`${OPENSKY_CREDENTIALS.username}:${OPENSKY_CREDENTIALS.password}`).toString('base64');
    requestOptions.headers = {
      'Authorization': `Basic ${auth}`
    };
    
    // 发送请求
    const response = await fetch(url, requestOptions);
    
    // 尝试匿名请求如果认证失败
    let data;
    if (response.status === 401) {
      console.log('OpenSky API认证失败，尝试匿名请求...');
      const anonymousResponse = await fetch(url);
      if (!anonymousResponse.ok) {
        return NextResponse.json({ message: '目标飞机当前不在追踪范围内。' }, { status: 404 });
      }
      data = await anonymousResponse.json();
    } else if (!response.ok) {
      return NextResponse.json({ message: '目标飞机当前不在追踪范围内。' }, { status: 404 });
    } else {
      data = await response.json();
    }
    
    // 检查是否有状态数据
    let aircraftData: AircraftInfo | null = null;
    
    if (data.states && data.states.length > 0) {
      // 找到匹配的飞机
      const aircraft = data.states.find((state: any[]) => 
        state[0].toLowerCase() === icao24
      );
      
      if (aircraft) {
        aircraftData = {
          icao24: aircraft[0],
          callsign: aircraft[1] ? aircraft[1].trim() : 'N/A',
          originCountry: aircraft[2],
          latitude: aircraft[6],
          longitude: aircraft[5],
          altitude: aircraft[7],
          velocity: aircraft[9],
          heading: aircraft[10],
          onGround: aircraft[8],
          lastContact: aircraft[4],
          verticalRate: aircraft[11],
          squawk: aircraft[14],
          spi: aircraft[15],
          positionSource: aircraft[16]
        };
      }
    }
    
    if (aircraftData) {
      return NextResponse.json(aircraftData);
    } else {
      return NextResponse.json({ message: '目标飞机当前不在追踪范围内。' }, { status: 404 });
    }
  } catch (error) {
    console.error('OpenSky API 错误:', error);
    return NextResponse.json({ error: '获取飞机数据失败' }, { status: 500 });
  }
} 