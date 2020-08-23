const EventEmitter = require('events')

const uuid = require('uuid').v4
const { componentLogger } = require('../logger')

const appName = process.env.APP_NAME
const appVersion = process.env.APP_VERSION

const context = (opts) => {

  opts = Object.assign({
    requestIdHeader: true,
    poweredByHeader: true
  }, opts || {})

  return (ctx, next) => {

    const requestId = ctx.request.header['x-request-id'] || uuid()
    ctx.requestId = requestId

    if (opts.requestIdHeader) {

      ctx.response.set('X-Request-ID', requestId)

    }

    if (opts.poweredByHeader) {

      ctx.response.set('X-Powered-By', `${appName}/${appVersion}`)

    }

    const emitter = new EventEmitter()

    emitter.on('error', () => {})

    ctx.on = (...args) => emitter.on(...args)
    ctx.once = (...args) => emitter.once(...args)
    ctx.emit = (...args) => emitter.emit(...args)
    ctx.off = (...args) => emitter.off(...args)
    ctx.removeAllListeners = (...args) => emitter.removeAllListeners(...args)

    ctx.logger = componentLogger({ subcomponent: 'request', requestId })

    return next()

  }

}

module.exports = context
