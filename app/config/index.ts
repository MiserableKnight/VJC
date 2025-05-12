/**
 * 配置模块索引
 * 统一导出所有配置
 */

// 导出环境变量配置
export * from './env';

// 导出应用配置
export * from './app';

// 导出默认环境变量配置
import { ENV, hasRequiredEnv } from './env';
export default {
  env: ENV,
  hasRequiredEnv
}; 