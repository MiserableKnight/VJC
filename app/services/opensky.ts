// 定义飞机信息接口
export interface AircraftInfo {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  onGround: boolean;
  lastContact: number;
  verticalRate: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
}

// 飞机ICAO24地址
const AIRCRAFT_ICAO24 = {
  B652G: '781cf2', // B-652G（COMAC ARJ21-700）
  B656E: '7820a2'  // B-656E（COMAC ARJ21-700）
};

// OpenSky API凭证
const OPENSKY_CREDENTIALS = {
  username: 'MiserableKnight',
  password: 'p8Sr4rJqmtg7BN!'
};

/**
 * 从OpenSky API响应中提取飞机信息
 */
function extractAircraftInfo(stateVector: any[]): AircraftInfo | null {
  if (!stateVector) return null;
  
  return {
    icao24: stateVector[0],
    callsign: stateVector[1] ? stateVector[1].trim() : 'N/A',
    originCountry: stateVector[2],
    latitude: stateVector[6],
    longitude: stateVector[5],
    altitude: stateVector[7],
    velocity: stateVector[9],
    heading: stateVector[10],
    onGround: stateVector[8],
    lastContact: stateVector[4],
    verticalRate: stateVector[11],
    squawk: stateVector[14],
    spi: stateVector[15],
    positionSource: stateVector[16]
  };
}

/**
 * 获取指定ICAO24地址的飞机状态
 * @param icao24 飞机的ICAO24地址
 * @param useAuth 是否使用认证（如果设为false则使用匿名访问）
 */
async function getAircraftState(icao24: string, useAuth: boolean = true): Promise<AircraftInfo | null> {
  try {
    // 构建API URL
    const url = `https://opensky-network.org/api/states/all?icao24=${icao24}`;
    
    // 请求配置
    const requestOptions: RequestInit = {};
    
    // 如果需要认证，添加认证头
    if (useAuth) {
      const auth = Buffer.from(`${OPENSKY_CREDENTIALS.username}:${OPENSKY_CREDENTIALS.password}`).toString('base64');
      requestOptions.headers = {
        'Authorization': `Basic ${auth}`
      };
    }
    
    // 发送请求
    const response = await fetch(url, requestOptions);
    
    // 处理错误状态
    if (response.status === 401) {
      console.error('OpenSky API认证失败（401 Unauthorized）: 用户名/密码错误或账号没有API权限');
      
      if (useAuth) {
        console.log('尝试匿名方式请求数据...');
        // 如果认证失败，尝试匿名请求
        return getAircraftState(icao24, false);
      }
      return null;
    }
    
    if (!response.ok) {
      console.error(`OpenSky API返回错误: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // 检查是否有状态数据
    if (data.states && data.states.length > 0) {
      // 找到匹配的飞机
      const aircraft = data.states.find((state: any[]) => 
        state[0].toLowerCase() === icao24.toLowerCase()
      );
      
      if (aircraft) {
        return extractAircraftInfo(aircraft);
      }
    }
    
    // 未找到飞机数据
    return null;
  } catch (error) {
    console.error('获取飞机数据时出错:', error);
    return null;
  }
}

/**
 * 获取VJC两架飞机的数据
 */
export async function getVJCAircraftData(): Promise<{
  B652G: AircraftInfo | null;
  B656E: AircraftInfo | null;
}> {
  try {
    // 并行获取两架飞机的数据
    const [b652gData, b656eData] = await Promise.all([
      getAircraftState(AIRCRAFT_ICAO24.B652G),
      getAircraftState(AIRCRAFT_ICAO24.B656E)
    ]);
    
    return {
      B652G: b652gData,
      B656E: b656eData
    };
  } catch (error) {
    console.error('获取飞机数据失败:', error);
    return {
      B652G: null,
      B656E: null
    };
  }
} 