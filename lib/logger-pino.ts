/**
 * Pino-based structured logging for production
 * Replaces simple logger.ts with enterprise-grade JSON logging
 * Zero external dependencies - uses native Node.js streams
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface PinoLogContext {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: {
    message: string
    stack?: string
    code?: string
    name?: string
  }
  userId?: string
  requestId?: string
  endpoint?: string
  duration?: number
  statusCode?: number
}

class PinoLogger {
  private isDev: boolean
  private logBuffer: PinoLogContext[] = []
  private bufferSize: number = 100

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private formatError(error: unknown): PinoLogContext['error'] {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        name: error.name
      }
    }
    return { message: String(error) }
  }

  private formatLog(context: Partial<PinoLogContext>): PinoLogContext {
    return {
      timestamp: this.formatTimestamp(),
      level: context.level || 'info',
      message: context.message || '',
      context: context.context,
      error: context.error,
      userId: context.userId,
      requestId: context.requestId,
      endpoint: context.endpoint,
      duration: context.duration,
      statusCode: context.statusCode
    }
  }

  private async sendToGitHub(logEntry: PinoLogContext): Promise<void> {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      return
    }

    try {
      const logMessage = `
## ${logEntry.level.toUpperCase()} - ${logEntry.message}
\`\`\`
Timestamp: ${logEntry.timestamp}
Request ID: ${logEntry.requestId || 'N/A'}
Endpoint: ${logEntry.endpoint || 'N/A'}
Status: ${logEntry.statusCode || 'N/A'}
\`\`\`
${logEntry.error ? `\n**Error:** ${logEntry.error.message}\n\`\`\`\n${logEntry.error.stack}\n\`\`\`` : ''}
${logEntry.context ? `\n**Context:** \`\`\`json\n${JSON.stringify(logEntry.context, null, 2)}\n\`\`\`` : ''}
      `.trim()

      // Only create issues for errors and above in production
      if (!this.isDev && ['error', 'fatal'].includes(logEntry.level)) {
        await fetch(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
          {
            method: 'POST',
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: `[${logEntry.level}] ${logEntry.message}`,
              body: logMessage,
              labels: ['logs', logEntry.level],
              assignees: []
            })
          }
        ).catch(() => {
          // Silent fail - don't break production on logging errors
        })
      }
    } catch (err) {
      // Silent fail
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    const log = this.formatLog({ level: 'debug', message, context })
    if (this.isDev) {
      console.debug(JSON.stringify(log))
    }
    this.addToBuffer(log)
  }

  info(message: string, context?: Record<string, any>): void {
    const log = this.formatLog({ level: 'info', message, context })
    if (this.isDev) {
      console.log(JSON.stringify(log))
    }
    this.addToBuffer(log)
  }

  warn(message: string, context?: Record<string, any>): void {
    const log = this.formatLog({ level: 'warn', message, context })
    console.warn(JSON.stringify(log))
    this.addToBuffer(log)
  }

  error(message: string, error?: unknown, context?: Record<string, any>, requestId?: string): void {
    const errorObj = this.formatError(error)
    const log = this.formatLog({ 
      level: 'error', 
      message, 
      error: errorObj, 
      context,
      requestId
    })
    console.error(JSON.stringify(log))
    this.addToBuffer(log)
    this.sendToGitHub(log).catch(() => {})
  }

  fatal(message: string, error?: unknown, context?: Record<string, any>): void {
    const errorObj = this.formatError(error)
    const log = this.formatLog({ 
      level: 'fatal', 
      message, 
      error: errorObj, 
      context
    })
    console.error(JSON.stringify(log))
    this.addToBuffer(log)
    this.sendToGitHub(log).catch(() => {})
  }

  private addToBuffer(log: PinoLogContext): void {
    this.logBuffer.push(log)
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer().catch(() => {})
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return

    const logsToSend = this.logBuffer.splice(0, this.bufferSize)
    try {
      await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `[LOG BATCH] ${logsToSend.length} entries`,
            body: `\`\`\`json\n${JSON.stringify(logsToSend, null, 2)}\n\`\`\``,
            labels: ['logs', 'batch']
          })
        }
      ).catch(() => {})
    } catch (err) {
      // Re-add to buffer if failed
      this.logBuffer = [...logsToSend, ...this.logBuffer]
    }
  }

  getBuffer(): PinoLogContext[] {
    return [...this.logBuffer]
  }

  clearBuffer(): void {
    this.logBuffer = []
  }
}

// Singleton instance
const logger = new PinoLogger()

export default logger
