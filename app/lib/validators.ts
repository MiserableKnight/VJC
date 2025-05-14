import { z } from 'zod';

// 日期范围验证
export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).refine(data => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "开始日期必须早于或等于结束日期",
  path: ["startDate"]
});

// 飞机注册号验证
export const AircraftRegistrationSchema = z.object({
  registration: z.string().regex(/^[A-Z]-\d{3}[A-Z]$/)
});

// API分页参数验证
export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20)
});

// 通用ID验证
export const IdSchema = z.object({
  id: z.string().uuid()
});

// 验证辅助函数
export async function validateRequestBody<T>(
  req: Request, 
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: '请求格式错误' };
  }
} 