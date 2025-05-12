import { getTodayForDisplay } from '../utils/dateUtils';

// 定义飞行历史记录类型
export interface FlightHistoryEntry {
  id: string;
  date: string;
  fromAirport: string;
  fromCode: string;
  toAirport: string;
  toCode: string;
  flightNumber: string;
  flightTime: string;
  scheduledDeparture: string;
  actualDeparture: string;
  scheduledArrival: string;
  status: string;
}

/**
 * 获取飞行历史数据
 * @param registration 飞机注册号，如 B-652G
 * @returns 飞行历史数据数组
 */
export async function fetchFlightHistory(registration: string): Promise<FlightHistoryEntry[]> {
  console.log(`获取飞机 ${registration} 的飞行历史数据（使用模拟数据）`);
  // 直接返回模拟数据
  return getFallbackFlightData(registration);
}

/**
 * 获取模拟数据
 * @param registration 飞机注册号
 * @returns 模拟的飞行历史数据
 */
export function getFallbackFlightData(registration: string): FlightHistoryEntry[] {
  const todayDisplay = getTodayForDisplay();
  
  const fallbackData: {[key: string]: FlightHistoryEntry[]} = {
    'B-652G': [
      {
        id: '1',
        date: todayDisplay,
        fromAirport: 'Con Dao',
        fromCode: 'VCS',
        toAirport: 'Hanoi',
        toCode: 'HAN',
        flightNumber: 'VJ102',
        flightTime: '2:03',
        scheduledDeparture: '04:35',
        actualDeparture: '05:08',
        scheduledArrival: '06:50',
        status: 'Landed 07:12'
      },
      {
        id: '2',
        date: todayDisplay,
        fromAirport: 'Ho Chi Minh City',
        fromCode: 'SGN',
        toAirport: 'Con Dao',
        toCode: 'VCS',
        flightNumber: 'VJ115',
        flightTime: '0:40',
        scheduledDeparture: '03:30',
        actualDeparture: '03:58',
        scheduledArrival: '04:10',
        status: 'Landed 04:38'
      }
    ],
    'B-656E': [
      {
        id: '1',
        date: todayDisplay,
        fromAirport: 'Con Dao',
        fromCode: 'VCS',
        toAirport: 'Hanoi',
        toCode: 'HAN',
        flightNumber: 'VJ104',
        flightTime: '2:01',
        scheduledDeparture: '07:05',
        actualDeparture: '07:30',
        scheduledArrival: '09:20',
        status: 'Landed 09:32'
      },
      {
        id: '2',
        date: todayDisplay,
        fromAirport: 'Ho Chi Minh City',
        fromCode: 'SGN',
        toAirport: 'Con Dao',
        toCode: 'VCS',
        flightNumber: 'VJ117',
        flightTime: '0:33',
        scheduledDeparture: '06:00',
        actualDeparture: '06:30',
        scheduledArrival: '06:40',
        status: 'Landed 07:04'
      }
    ]
  };
  
  return fallbackData[registration] || [];
} 