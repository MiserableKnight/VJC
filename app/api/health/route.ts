import { checkHealth } from '../controllers/health';

export async function GET() {
  return checkHealth();
} 