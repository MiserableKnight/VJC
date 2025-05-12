import { getVJCAircraft, getSingleAircraft } from '../controllers/aircraft';
import { badRequestResponse } from '../../lib/api-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icao24 = searchParams.get('icao24')?.toLowerCase();
  const isVjc = searchParams.get('vjc') === 'true';
  
  // 如果指定了vjc=true参数，则获取VJC飞机数据
  if (isVjc) {
    return getVJCAircraft();
  }
  
  // 单个飞机查询模式
  if (!icao24) {
    return badRequestResponse('需要提供ICAO24参数或使用vjc=true参数');
  }
  
  return getSingleAircraft(icao24);
} 