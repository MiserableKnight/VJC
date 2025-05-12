import { NextRequest } from 'next/server';
import { getData } from '../controllers/data';

export async function GET(request: NextRequest) {
  return getData(request);
} 