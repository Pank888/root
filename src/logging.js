import { join } from 'path'
import errorHandler from 'express-error-handler'
import morgan from 'morgan'
import winston from 'winston'
winston.emitErrs = true

export const initiateLogging =
  (app) => {
    const dirs = app.get('dirs')
    const env = app.get('env')
    const name = app.get('name') || 'magic-app'
    const logDir = dirs.logs || join(__dirname, '..', 'logs')
    const logFile = app.get('logFile') || join(logDir, `${name}-access.log`)

    const errorHandlerOptions =
      env === 'development'
        ? { dumpExceptions: true, showStack: true }
        : {}

    app.use(errorHandler(errorHandlerOptions))

    const level =
        env === 'development'
        ? 'debug'
        : 'info'

    const transports = [
      new winston.transports.Console({
        level,
        handleExceptions: true,
        json: false,
        colorize: true,
      }),
    ]

    if (logFile) {
      transports.push(new winston.transports.File({
        filename: logFile,
        level,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 50,
        colorize: false,
      }))
    }

    const logger = new winston.Logger({
      transports,
      exitOnError: false,
    })

    app.set('logger', logger)

    const logLevel = app.get('logLevel') || 'combined'
    const stream = { write: (msg) => logger.info(msg) }
    app.use(morgan(logLevel, { stream }))
  }

export default initiateLogging
