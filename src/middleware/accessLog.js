const accessLog = (opts) => {

  opts = Object.assign({ logger: true }, opts || {})

  return async (ctx, next) => {

    const start = Date.now()
    const path = ctx.request.originalUrl
    const method = ctx.method

    if (path === '/metrics' && opts.loggerIgnoreMetrics) {

      return next()

    }

    if (opts.logger) {

      ctx.logger.debug('Request inbound', { method, path })

    }

    try {

      await next()

    } finally {

      const requestTime = Date.now() - start
      const statusCode = ctx.status
      const user = ctx.user ? ctx.user.id : undefined

      if (opts.logger) {

        ctx.logger.debug('Request complete', { requestTime, method, path, user, statusCode })

      }

    }

  }

}

module.exports = accessLog
