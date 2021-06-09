const EventEmitter = require('events')

const uuid = require('uuid').v4
const { componentLogger } = require('../logger')

const context = (opts) => {

  opts = Object.assign({
    requestIdHeader: true,
    poweredByHeader: true,
    serviceName: opts.serviceName || process.env.APP_NAME,
    serviceVersion: opts.serviceVersion || process.env.APP_VERSION
  }, opts || {})

  return async (ctx, next) => {

    const requestIdHeader = ctx.request.header['x-request-id']
    const requestId = requestIdHeader && (requestIdHeader !== 'null' && requestIdHeader !== 'undefined') ? requestIdHeader : uuid()

    ctx.requestId = requestId

    if (opts.requestIdHeader) {

      ctx.response.set('X-Request-ID', requestId)

    }

    if (opts.poweredByHeader) {

      ctx.response.set('X-Powered-By', `${opts.serviceName}/${opts.serviceVersion}`)

    }

    const emitter = new EventEmitter()

    emitter.on('error', () => {})

    ctx.on = (...args) => emitter.on(...args)
    ctx.once = (...args) => emitter.once(...args)
    ctx.emit = (...args) => emitter.emit(...args)
    ctx.off = (...args) => emitter.off(...args)
    ctx.removeAllListeners = (...args) => emitter.removeAllListeners(...args)

    ctx.logger = componentLogger({ subcomponent: 'request', requestId })

    try {

      await next()

    } finally {

      emitter.removeAllListeners()

    }

  }

}

module.exports = context
