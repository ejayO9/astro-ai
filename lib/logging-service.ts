/**
 * A simple logging service to capture logs from different parts of the application
 */

export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogEntry {
  timestamp: string
  level: LogLevel
  source: string
  message: string
  data?: any
}

export class LoggingService {
  private static logs: LogEntry[] = []
  private static maxLogs = 100

  /**
   * Add a log entry
   */
  static log(level: LogLevel, source: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data: data ? this.sanitizeData(data) : undefined,
    }

    this.logs.unshift(entry) // Add to beginning for chronological order (newest first)

    // Keep logs under the maximum size
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }

    // Also log to console for server-side debugging
    console[level](`[${entry.timestamp}] [${source}] ${message}`, data ? data : "")
  }

  /**
   * Get all logs
   */
  static getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = []
  }

  /**
   * Sanitize data to prevent circular references and limit depth
   */
  private static sanitizeData(data: any, depth = 0): any {
    if (depth > 2) return "[Object]" // Limit nesting depth

    if (data === null || data === undefined) return data

    if (typeof data !== "object") return data

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item, depth + 1))
    }

    const sanitized: Record<string, any> = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Skip functions and large objects
        if (typeof data[key] === "function") {
          sanitized[key] = "[Function]"
        } else if (key === "content" && typeof data[key] === "string" && data[key].length > 100) {
          sanitized[key] = `${data[key].substring(0, 100)}... [truncated]`
        } else {
          sanitized[key] = this.sanitizeData(data[key], depth + 1)
        }
      }
    }
    return sanitized
  }
}

// Helper functions for easier logging
export function logInfo(source: string, message: string, data?: any): void {
  LoggingService.log("info", source, message, data)
}

export function logWarn(source: string, message: string, data?: any): void {
  LoggingService.log("warn", source, message, data)
}

export function logError(source: string, message: string, data?: any): void {
  LoggingService.log("error", source, message, data)
}

export function logDebug(source: string, message: string, data?: any): void {
  LoggingService.log("debug", source, message, data)
}
