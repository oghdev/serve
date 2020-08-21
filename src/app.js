const Koa = require('koa')
const KoaRouter = require('@koa/router')

const util = require('util')
const mounter = require('koa-mount')
const compose = require('koa-compose')

const logger = require('./logger')
const middleware = require('./middleware')

const createServer = () => new Koa()

const createApp = (opts) => {

  opts = Object.assign({
    logger: true,
    production: undefined,
    throwErrorOnNotFound: true,
    errorHandler: true,
    accessLog: true,
    bodyParser: true
  }, opts || {})

  const production = opts.production === undefined
    ? process.env.NODE_ENV === 'production'
    : opts.production === true

  const app = createServer()

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

  const listen = (port) => new Promise((resolve, reject) => {

    if (opts.throwErrorOnNotFound) {

      app.use((ctx, next) => {


        throw { name: 'NotFoundError' }

      })

    }

    app.listen(port, (err) => {

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

  return {
    logger,
    listen,
    use,
    app
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
