import { getLegData } from '../controllers/leg-data';

/**
 * 航段数据API路由
 */
export async function GET() {
  return getLegData();
} 