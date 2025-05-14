import { getEconomicData } from '../controllers/economic-data';

/**
 * 经济性数据API路由
 */
export async function GET() {
  return getEconomicData();
} 