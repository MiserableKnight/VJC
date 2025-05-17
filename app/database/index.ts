// app/database/index.ts
import { logEnvironmentConfig } from '../config/env';

// 打印环境配置
console.log('=================== 数据库配置初始化 ===================');
logEnvironmentConfig();
console.log('========================================================');

// 导出所有模块
export * from './models';
export * from './config';
export * from './connection';
export * from './queries';

// 导出默认查询对象
import queries from './queries';
export default {
  ...queries,
  // 其他导出方法
}; 