const Koa = require('koa')
const KoaRouter = require('@koa/router')

const http = require('http')
const mounter = require('koa-mount')
const compose = require('koa-compose')

const { logger } = require('./logger')
const middleware = require('./middleware')

const createServer = () => new Koa()

const createApp = (opts) => {

  const production = opts.production === undefined
    ? process.env.NODE_ENV === 'production'
    : opts.production === true

  opts = Object.assign({
    logger: true,
    production: production,
    throwErrorOnNotFound: true,
    apm: false,
    errorHandler: true,
    accessLog: true,
    bodyParser: true,
    closeTimeout: 15000,
    ignoreClientErrors: true
  }, opts || {})

  const app = createServer()

  app.use(middleware.context(app))

  if (opts.errorHandler) {

    app.use(middleware.errorHandler(opts))

    app.on('error', middleware.errorHandler.appErrorHandler(opts))

  }

  if (opts.accessLog) {

    app.use(middleware.accessLog(opts))

  }

  if (opts.bodyParser) {

    app.use(middleware.bodyParser())

  }

  const use = app.use.bind(app)

  const on = app.on.bind(app)
  const emit = app.emit.bind(app)

  const server = http.createServer(app.callback())

  const listen = (bind) => new Promise((resolve, reject) => {

    if (opts.apm) {

      app.use(middleware.useApm(opts))

    }

    if (opts.throwErrorOnNotFound) {

      app.use((ctx, next) => {

        throw Object.assign(new Error('Resource not found'), { name: 'NotFoundError', statusCode: 404 })

      })

    }

    server.listen(bind, (err) => {

      const { port } = server.address()

      if (err) {

        reject(err)

        return

      }

      app.emit('listening', { port, production })

      if (opts.logger) {

        logger.info('Server listening', { port, production })

      }

      resolve(port)

    })

  })

  let closing = false
  const connections = {}

  app.on('connection', (conn) => {

    const key = `${conn.remoteAddress}:${conn.remotePort}`

    connections[key] = conn

    conn.on('close', () => {

      delete connections[key]

    })

  })

  const close = () => new Promise((resolve, reject) => {

    closing = true

    if (opts.logger) {

      logger.info('Server shutting down. Closing all open connections.')

    }

    setTimeout(() => {

      if (opts.logger) {

        logger.error('Server shutdown timeout, forcefully shutting down')

      }

      process.exit(1)

    }, opts.closeTimeout)

    for (var key in connections) {

      connections[key].destroy()

    }

    server.close((err) => {

      if (err) {

        reject(err)

        return

      }

      resolve()

    })

  })

  use((ctx, next) => {

    if (!closing) {

      return next()

    }

    ctx.set('Connection', 'close')

    ctx.status = 503
    ctx.body = ''

  })

  const useKeys = (keys) => {

    app.keys = keys

  }

  return {
    app,
    close,
    emit,
    listen,
    on,
    use,
    useKeys,
    logger
  }

}

const createRouter = (prefix, opts) => {

  opts = Object.assign({ throwErrorOnNotFound: true }, opts || {})

  const router = new KoaRouter()

  const mount = () => {

    if (opts.throwErrorOnNotFound) {

      router.use(() => {

        throw Object.assign(new Error('Resource not found'), { name: 'NotFoundError', statusCode: 404 })

      })

    }

    const mw = compose([ router.routes(), router.allowedMethods() ])

    if (prefix) {

      return mounter(prefix, mw)

    }

    return mw

  }

  router.mount = mount

  return router

}

module.exports = { createServer, createApp, createRouter }
