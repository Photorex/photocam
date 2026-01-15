/**
 * Centralized Logger for Critical Events
 * All critical errors, warnings, and events are logged here
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = '/home/dev1/.pm2/logs/critical';
const LOG_FILE = path.join(LOG_DIR, 'critical-errors.log');

// Ensure log directory exists
if (typeof window === 'undefined') {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  stack?: string;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, category, message, details, stack } = entry;
    let log = `[${timestamp}] [${level}] [${category}] ${message}`;
    
    if (details) {
      log += `\nDetails: ${JSON.stringify(details, null, 2)}`;
    }
    
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    return log + '\n' + '='.repeat(80) + '\n';
  }

  private writeToFile(log: string) {
    if (typeof window === 'undefined') {
      try {
        fs.appendFileSync(LOG_FILE, log);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  log(level: LogLevel, category: string, message: string, details?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      stack: error?.stack,
    };

    const formattedLog = this.formatLog(entry);

    // Always console log
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.error(formattedLog);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }

    // Write to file for WARN, ERROR, CRITICAL
    if (level !== LogLevel.INFO) {
      this.writeToFile(formattedLog);
    }
  }

  info(category: string, message: string, details?: any) {
    this.log(LogLevel.INFO, category, message, details);
  }

  warn(category: string, message: string, details?: any) {
    this.log(LogLevel.WARN, category, message, details);
  }

  error(category: string, message: string, details?: any, error?: Error) {
    this.log(LogLevel.ERROR, category, message, details, error);
  }

  critical(category: string, message: string, details?: any, error?: Error) {
    this.log(LogLevel.CRITICAL, category, message, details, error);
  }

  // Memory monitoring
  logMemoryUsage(category: string) {
    if (typeof window === 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const usageMB = {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
      };

      // Warn if heap usage is high
      const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
      if (heapUsagePercent > 80) {
        this.warn(category, `High memory usage: ${heapUsagePercent.toFixed(2)}%`, usageMB);
      } else {
        this.info(category, 'Memory usage', usageMB);
      }
    }
  }
}

export const logger = Logger.getInstance();

// Global error handlers (server-side only)
if (typeof window === 'undefined') {
  process.on('uncaughtException', (error: Error) => {
    logger.critical('PROCESS', 'Uncaught Exception', { error: error.message }, error);
    // Don't exit - PM2 will restart
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.critical('PROCESS', 'Unhandled Promise Rejection', { 
      reason: reason?.message || reason,
      promise: promise.toString(),
    });
  });

  process.on('warning', (warning: Error) => {
    logger.warn('PROCESS', 'Process Warning', { warning: warning.message });
  });

  // Log memory every 5 minutes
  setInterval(() => {
    logger.logMemoryUsage('MEMORY_MONITOR');
  }, 5 * 60 * 1000);
}

