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

  return (err) => {

    if (!err) {

      return

    }

    if (opts.logger) {

      const error = serializeError(err)

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

    } catch (err) {

      const requestId = ctx.requestId

      const resolvedErr = resolveError(err, opts.production)

      const statusCode = resolvedErr.statusCode || 500

      const body = {
        requestId,
        status: statusCode,
        error: resolvedErr
      }

      if (opts.logger) {

        const error = serializeError(err)

        logger.error('Server error', { error, requestId })

      }

      ctx.status = statusCode
      ctx.body = body

    }

  }

}

errorHandler.appErrorHandler = appErrorHandler

module.exports = errorHandler
