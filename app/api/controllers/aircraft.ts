import { getVJCAircraftData, AircraftInfo } from '../../services/opensky';
import { successResponse, errorResponse, notFoundResponse, badRequestResponse } from '../../lib/api-utils';

// 飞机ICAO24地址
const VJC_AIRCRAFT_ICAO24 = {
  B652G: '781cf2', // B-652G（COMAC ARJ21-700）
  B656E: '7820a2'  // B-656E（COMAC ARJ21-700）
};

/**
 * 获取VJC航空公司飞机数据
 */
export async function getVJCAircraft() {
  try {
    const vjcAircraftData = await getVJCAircraftData();
    
    const hasData = vjcAircraftData.B652G !== null || vjcAircraftData.B656E !== null;
    
    if (hasData) {
      return successResponse(vjcAircraftData);
    } else {
      return notFoundResponse('目前未能获取到飞机数据，可能飞机不在追踪范围内或OpenSky API暂时不可用');
    }
  } catch (error) {
    console.error('OpenSky API 错误:', error);
    return errorResponse('获取飞机数据失败');
  }
}

/**
 * 获取单个飞机数据
 * @param icao24 飞机ICAO24地址
 */
export async function getSingleAircraft(icao24: string) {
  if (!icao24) {
    return badRequestResponse('需要提供ICAO24参数');
  }
  
  try {
    // 使用服务中的getAircraftState函数获取单个飞机数据
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
        return notFoundResponse('目标飞机当前不在追踪范围内。');
      }
      data = await anonymousResponse.json();
    } else if (!response.ok) {
      return notFoundResponse('目标飞机当前不在追踪范围内。');
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
      return successResponse(aircraftData);
    } else {
      return notFoundResponse('目标飞机当前不在追踪范围内。');
    }
  } catch (error) {
    console.error('OpenSky API 错误:', error);
    return errorResponse('获取飞机数据失败');
  }
} 