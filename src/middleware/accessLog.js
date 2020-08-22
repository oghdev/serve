const uuid = require('uuid').v4

const logger = require('../logger')

const appName = process.env.APP_NAME
const appVersion = process.env.APP_VERSION

const accessLog = (opts) => {

  opts = Object.assign({ logger: true }, opts || {})

  return async (ctx, next) => {

    const start = Date.now()
    const requestId = ctx.request.header['x-request-id'] || uuid()
    const path = ctx.request.path
    const method = ctx.method

    if (opts.logger) {

      logger.debug('Request inbound', { requestId, method, path })

    }

    ctx.requestId = requestId

    ctx.response.set('X-Request-ID', requestId)
    ctx.response.set('X-Powered-By', `${appName}/${appVersion}`)

    try {

      await next()

    } finally {

      const requestTime = Date.now() - start
      const statusCode = ctx.status
      const user = ctx.user ? ctx.user.id : undefined

      if (opts.logger) {

        logger.debug('Request complete', { requestId, requestTime, method, path, user, statusCode })

      }

    }

  }

}

module.exports = accessLog
