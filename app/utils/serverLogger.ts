// 此文件仅在服务器端使用，不应被客户端代码直接导入
// 添加服务器组件标记
'use server';

import fs from 'node:fs';
import path from 'node:path';
import { promises as fsPromises } from 'node:fs';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE'
}

/**
 * 日志类别枚举
 */
export enum LogCategory {
  API = 'API',
  DATABASE = 'DATABASE',
  AUTH = 'AUTH',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ANALYTICS = 'ANALYTICS',
  CUSTOM = 'CUSTOM'
}

/**
 * 日志条目接口
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
  source?: string;
  trace?: string;
}

/**
 * 服务器日志配置接口
 */
interface ServerLoggerConfig {
  logDir?: string;
  retentionDays?: number;
  consoleOutput?: boolean;
  minLevel?: LogLevel;
  formatJson?: boolean;
}

/**
 * 日志级别权重映射
 */
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
  [LogLevel.TRACE]: 4
};

/**
 * 默认日志配置
 */
const DEFAULT_CONFIG: ServerLoggerConfig = {
  logDir: path.join(process.cwd(), 'logs'),
  retentionDays: 30,
  consoleOutput: true,
  minLevel: LogLevel.INFO,
  formatJson: true
};

/**
 * 服务器日志记录系统
 */
class ServerLogger {
  private config: ServerLoggerConfig;
  private static instance: ServerLogger | null = null;

  private constructor(config: ServerLoggerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureLogDirectory();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: ServerLoggerConfig): ServerLogger {
    if (!ServerLogger.instance) {
      ServerLogger.instance = new ServerLogger(config);
    }
    return ServerLogger.instance;
  }

  /**
   * 确保日志目录存在
   */
  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.config.logDir!)) {
        fs.mkdirSync(this.config.logDir!, { recursive: true });
      }
    } catch (error) {
      console.error('无法创建日志目录:', error);
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.formatJson) {
      return JSON.stringify(entry);
    } else {
      return `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}${
        entry.details ? ` | ${JSON.stringify(entry.details)}` : ''
      }${entry.source ? ` | ${entry.source}` : ''}`;
    }
  }

  /**
   * 记录日志
   */
  private async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: Record<string, any>
  ): Promise<void> {
    // 检查日志级别
    if (LOG_LEVEL_WEIGHT[level] > LOG_LEVEL_WEIGHT[this.config.minLevel!]) {
      return;
    }

    // 创建日志条目
    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      timestamp,
      level,
      category,
      message,
      details
    };

    // 获取调用堆栈
    if (level === LogLevel.ERROR) {
      const stack = new Error().stack;
      if (stack) {
        const stackLines = stack.split('\n').slice(2);
        entry.trace = stackLines.join('\n');
        entry.source = stackLines[0].trim();
      }
    }

    // 输出到控制台
    if (this.config.consoleOutput) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                          level === LogLevel.WARN ? 'warn' : 'log';
      
      console[consoleMethod](
        `[${level}] [${category}]`, 
        message, 
        details || ''
      );
    }

    // 写入日志文件
    try {
      const today = new Date().toISOString().split('T')[0];
      const categoryName = category.toLowerCase();
      const levelName = level.toLowerCase();
      
      // 按类别和日期组织日志文件
      const logFile = path.join(
        this.config.logDir!,
        `${categoryName}-${today}.log`
      );
      
      // 如果是错误日志，同时记录到错误专用日志
      if (level === LogLevel.ERROR) {
        const errorLogFile = path.join(
          this.config.logDir!,
          `errors-${today}.log`
        );
        
        await this.appendToFile(errorLogFile, entry);
      }
      
      // 记录到类别日志
      await this.appendToFile(logFile, entry);
      
      // 记录到综合日志
      const allLogFile = path.join(
        this.config.logDir!,
        `all-${today}.log`
      );
      
      await this.appendToFile(allLogFile, entry);
      
    } catch (error) {
      console.error('写入日志文件失败:', error);
    }
  }

  /**
   * 追加到日志文件
   */
  private async appendToFile(filePath: string, entry: LogEntry): Promise<void> {
    try {
      const formattedEntry = this.formatLogEntry(entry) + '\n';
      await fsPromises.appendFile(filePath, formattedEntry, {
        flag: 'a+'
      });
    } catch (error) {
      console.error(`无法写入日志到文件 ${filePath}:`, error);
    }
  }

  /**
   * 错误日志
   */
  public error(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    details?: Record<string, any>
  ): void {
    this.log(LogLevel.ERROR, category, message, details);
  }

  /**
   * 警告日志
   */
  public warn(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    details?: Record<string, any>
  ): void {
    this.log(LogLevel.WARN, category, message, details);
  }

  /**
   * 信息日志
   */
  public info(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    details?: Record<string, any>
  ): void {
    this.log(LogLevel.INFO, category, message, details);
  }

  /**
   * 调试日志
   */
  public debug(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    details?: Record<string, any>
  ): void {
    this.log(LogLevel.DEBUG, category, message, details);
  }

  /**
   * 跟踪日志
   */
  public trace(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    details?: Record<string, any>
  ): void {
    this.log(LogLevel.TRACE, category, message, details);
  }

  /**
   * 记录API请求
   */
  public logApiRequest(request: {
    method: string;
    path: string;
    query?: Record<string, any>;
    headers?: Record<string, any>;
    body?: any;
    ip?: string;
    userAgent?: string;
  }): void {
    this.info(
      `API请求: ${request.method} ${request.path}`,
      LogCategory.API,
      {
        ...request,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * 记录API响应
   */
  public logApiResponse(response: {
    statusCode: number;
    path: string;
    method: string;
    duration: number;
    requestId?: string;
  }): void {
    const level = response.statusCode >= 400 
      ? (response.statusCode >= 500 ? LogLevel.ERROR : LogLevel.WARN) 
      : LogLevel.INFO;
    
    this.log(
      level,
      LogCategory.API,
      `API响应: ${response.method} ${response.path} ${response.statusCode}`,
      {
        ...response,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * 记录数据库操作
   */
  public logDbOperation(operation: {
    type: 'query' | 'mutation' | 'transaction';
    table?: string;
    action: string;
    duration: number;
    success: boolean;
    error?: any;
  }): void {
    const level = operation.success ? LogLevel.INFO : LogLevel.ERROR;
    const message = `数据库${operation.type}: ${operation.action}${
      operation.table ? ` [表:${operation.table}]` : ''
    } ${operation.success ? '成功' : '失败'} (${operation.duration}ms)`;
    
    this.log(level, LogCategory.DATABASE, message, {
      ...operation,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录认证事件
   */
  public logAuth(event: {
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_attempt';
    userId?: string;
    username?: string;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    reason?: string;
  }): void {
    const success = event.success !== false;
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `认证事件: ${event.action} ${
      success ? '成功' : '失败'
    }${event.userId ? ` [用户:${event.userId}]` : ''}`;
    
    this.log(level, LogCategory.AUTH, message, {
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录性能指标
   */
  public logPerformance(metric: {
    name: string;
    value: number;
    unit?: string;
    context?: Record<string, any>;
  }): void {
    this.info(
      `性能指标: ${metric.name} = ${metric.value}${metric.unit || ''}`,
      LogCategory.PERFORMANCE,
      {
        ...metric,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * 记录安全事件
   */
  public logSecurity(event: {
    type: 'injection' | 'bruteforce' | 'csrf' | 'xss' | 'permission' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip?: string;
    userId?: string;
    path?: string;
    headers?: Record<string, any>;
  }): void {
    const levelMap = {
      'low': LogLevel.WARN,
      'medium': LogLevel.WARN,
      'high': LogLevel.ERROR,
      'critical': LogLevel.ERROR
    };
    
    this.log(
      levelMap[event.severity],
      LogCategory.SECURITY,
      `安全事件: ${event.type} - ${event.description}`,
      {
        ...event,
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * 清理旧日志文件
   */
  public async cleanupOldLogs(): Promise<void> {
    try {
      const logFiles = await fsPromises.readdir(this.config.logDir!);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays!);
      const cutoffString = cutoffDate.toISOString().split('T')[0];
      
      for (const file of logFiles) {
        // 匹配带日期的日志文件名，如 "category-2023-10-15.log"
        const dateMatch = file.match(/\d{4}-\d{2}-\d{2}\.log$/);
        if (dateMatch) {
          const fileDate = dateMatch[0].slice(0, 10);
          if (fileDate < cutoffString) {
            const filePath = path.join(this.config.logDir!, file);
            await fsPromises.unlink(filePath);
            console.log(`已删除过期日志文件: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('清理旧日志文件失败:', error);
    }
  }

  /**
   * 获取日志文件列表
   */
  public async getLogFiles(
    category?: LogCategory,
    startDate?: string,
    endDate?: string
  ): Promise<string[]> {
    try {
      const files = await fsPromises.readdir(this.config.logDir!);
      let filteredFiles = files.filter(file => file.endsWith('.log'));
      
      // 按类别筛选
      if (category) {
        const categoryPrefix = category.toLowerCase() + '-';
        filteredFiles = filteredFiles.filter(file => 
          file.startsWith(categoryPrefix) || file.startsWith('all-')
        );
      }
      
      // 按日期范围筛选
      if (startDate || endDate) {
        filteredFiles = filteredFiles.filter(file => {
          const dateMatch = file.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            const fileDate = dateMatch[0];
            if (startDate && fileDate < startDate) return false;
            if (endDate && fileDate > endDate) return false;
            return true;
          }
          return false;
        });
      }
      
      return filteredFiles.map(file => path.join(this.config.logDir!, file));
    } catch (error) {
      console.error('获取日志文件列表失败:', error);
      return [];
    }
  }

  /**
   * 搜索日志
   */
  public async searchLogs(options: {
    level?: LogLevel;
    category?: LogCategory;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    const { level, category, startDate, endDate, search, limit = 100 } = options;
    
    try {
      // 获取日志文件
      const files = await this.getLogFiles(category, startDate, endDate);
      const results: LogEntry[] = [];
      
      // 遍历文件查找匹配的日志
      for (const file of files) {
        const content = await fsPromises.readFile(file, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            // 解析日志条目
            const entry = this.config.formatJson 
              ? JSON.parse(line) as LogEntry
              : this.parseLogLine(line);
            
            // 应用筛选条件
            if (level && entry.level !== level) continue;
            if (search && !line.toLowerCase().includes(search.toLowerCase())) continue;
            
            results.push(entry);
            
            // 检查是否达到限制
            if (results.length >= limit) break;
          } catch (parseError) {
            continue; // 跳过无法解析的行
          }
        }
        
        // 检查是否达到限制
        if (results.length >= limit) break;
      }
      
      // 按时间戳排序
      return results.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('搜索日志失败:', error);
      return [];
    }
  }

  /**
   * 解析非JSON格式日志行
   */
  private parseLogLine(line: string): LogEntry {
    try {
      // 匹配日志格式: [timestamp] [level] [category] message | details | source
      const regex = /\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*?)(?:\s+\|\s+(.*?))?(?:\s+\|\s+(.*?))?$/;
      const match = line.match(regex);
      
      if (!match) {
        throw new Error('无法解析日志行');
      }
      
      const [, timestamp, level, category, message, detailsStr, source] = match;
      let details: Record<string, any> | undefined;
      
      if (detailsStr) {
        try {
          details = JSON.parse(detailsStr);
        } catch (e) {
          details = { raw: detailsStr };
        }
      }
      
      return {
        timestamp,
        level: level as LogLevel,
        category: category as LogCategory,
        message,
        details,
        source
      };
    } catch (error) {
      // 如果解析失败，返回基本格式
      return {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        category: LogCategory.SYSTEM,
        message: line
      };
    }
  }
}

// 导出单例实例
export const logger = ServerLogger.getInstance();

// 导出默认实例和类
export default logger; 