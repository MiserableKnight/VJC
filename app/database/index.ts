// app/database/index.ts

// 导出所有模块
export * from './models';
export * from './config';
export * from './connection';
export * from './queries';

// 导出默认查询对象
import queries from './queries';
export default queries; 