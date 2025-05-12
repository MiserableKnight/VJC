// app/lib/dbConfig.ts
// 此文件仅作为过渡，重新导出新的数据库配置模块，以保持向后兼容性

export * from '../database/config';
export type { DbConfig } from '../database/models';

// 导出默认配置函数
import { getDbConfig } from '../database/config';
export default getDbConfig; 