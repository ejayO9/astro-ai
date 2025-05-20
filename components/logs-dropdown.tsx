"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { LogEntry } from "@/lib/logging-service"
import { Badge } from "@/components/ui/badge"

interface LogsDropdownProps {
  logs: LogEntry[]
}

export default function LogsDropdown({ logs }: LogsDropdownProps) {
  const [showLogs, setShowLogs] = useState(false)

  if (!logs || logs.length === 0) {
    return null
  }

  // Get counts by log level
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get badge color based on log level
  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warn":
        return "warning"
      case "info":
        return "secondary"
      case "debug":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="ml-11 mr-4 mt-2">
      <button
        onClick={() => setShowLogs(!showLogs)}
        className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showLogs ? (
          <>
            <ChevronUp size={14} className="mr-1" /> Hide execution logs
          </>
        ) : (
          <>
            <ChevronDown size={14} className="mr-1" /> Show execution logs
            <div className="flex ml-2 gap-1">
              {Object.entries(counts).map(([level, count]) => (
                <Badge key={level} variant={getBadgeVariant(level)} className="text-xs px-1.5 py-0">
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </>
        )}
      </button>

      {showLogs && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 overflow-auto max-h-96">
          <div className="font-semibold mb-1">Execution Logs:</div>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-1 rounded ${
                  log.level === "error"
                    ? "bg-red-50 text-red-800"
                    : log.level === "warn"
                      ? "bg-yellow-50 text-yellow-800"
                      : log.level === "info"
                        ? "bg-blue-50 text-blue-800"
                        : "bg-gray-50 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(log.level)} className="text-xs">
                    {log.level}
                  </Badge>
                  <span className="font-medium">[{log.source}]</span>
                  <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="mt-1">{log.message}</div>
                {log.data && (
                  <pre className="mt-1 p-1 bg-gray-100 rounded overflow-auto text-xs">
                    {typeof log.data === "string" ? log.data : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
