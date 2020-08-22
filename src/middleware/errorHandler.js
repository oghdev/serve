const { serializeError } = require('serialize-error')

const logger = require('../logger')

const resolveError = (err, production) => {

  if (err.name === 'ValidationError') {

    return {
      name: 'ValidationError',
      message: err.message,
      statusCode: 400
    }

  } else if (err.name === 'NotFoundError') {

    return {
      name: 'NotFoundError',
      message: err.message,
      statusCode: 404
    }

  } else if (production) {

    return {
      name: 'Error',
      message: 'Internal server error',
      statusCode: 500
    }

  } else {

    return serializeError(err)

  }

}

const appErrorHandler = (opts) => {

  opts = Object.assign({ logger: true }, opts || {})

  return (error) => {

    if (!error) {

      return

    }

    if (opts.logger && error.statusCode && error.statusCode > 499) {

      logger.error('Server error', { error })

    } else if (opts.logger && error.statusCode && !opts.ignoreClientErrors) {

      logger.debug('Client error', { error })

    } else {

      logger.error('App error', { error })

    }

  }

}

const errorHandler = (opts) => {

  opts = Object.assign({
    logger: true,
    production: false
  }, opts || {})

  return async (ctx, next) => {

    try {

      ctx.onerror = appErrorHandler(opts)

      await next()

    } catch (error) {

      ctx.emit('error', error)

      const requestId = ctx.requestId

      const resolvedErr = resolveError(error, opts.production)

      const statusCode = resolvedErr.statusCode || 500

      const body = {
        requestId,
        status: statusCode,
        error: resolvedErr
      }

      if (opts.logger && statusCode > 499) {

        logger.error('Server error', { error, requestId })

      } else if (opts.logger && !opts.ignoreClientErrors) {

        logger.debug('Client error', { error, requestId })

      }

      ctx.status = statusCode
      ctx.body = body

    }

  }

}

errorHandler.appErrorHandler = appErrorHandler

module.exports = errorHandler
