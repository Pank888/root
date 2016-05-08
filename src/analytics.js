import { join } from 'path'
import winston from 'winston'

export const analytics =
  (app) => {
    const dirs = app.get('dirs')
    const name = app.get('name') || 'magic-app'
    const logDir = dirs.logs
    const logFile = join(logDir, `${name}-analytics.log`)

    const levels = {
      a: 0,
    }

    const transports = [
      new winston.transports.File({
        filename: logFile,
        level: 'a',
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 50,
        colorize: false,
      }),
    ]

    const logger = new winston.Logger({ transports, levels })

    const logHandler =
      (req, res, next) => {
        const { ip, method, path } = req
        logger.a(`
          Access:
          From: ${ip}
          Method: ${method}
          Path: ${path}
        `)

        next()
      }

    app.use('*', logHandler)
  }

export default analytics
