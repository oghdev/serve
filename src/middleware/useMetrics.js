const { logger } = require('../logger')
const { Counter, register } = require('prom-client')
const koaProm = require('koa-prometheus-adv')
const compose = require('koa-compose')

const captureLogEvent = (counter) => (e) => {

  const { level, component, statusCode } = e

  const res = { level, component }

  if (statusCode) {

    res.statusCode = statusCode

  }

  counter.inc(res)

  counter.inc(Object.assign(
    {}, res, { component: 'all' }
  ))

}

const promMiddleware = (opts) => {

  logger.on('log', captureLogEvent(opts.counter))
  register.setDefaultLabels({ serviceName: opts.serviceName, serviceVersion: opts.serviceVersion })

  return koaProm.DefaultHTTPMetricsInjector(register)

}

const metricsHandler = (opts) => async (ctx, next) => {

  if (ctx.request.method === 'GET' && ctx.request.url === '/metrics') {

    const metrics = await register.metrics()

    ctx.status = 200
    ctx.body = metrics

  } else {

    ctx.logger.on('log', captureLogEvent(opts.counter))

    return next()

  }

}

const useMetrics = (opts) => {

  opts = Object.assign({
    serviceName: opts.serviceName || process.env.APP_NAME,
    serviceVersion: opts.serviceVersion || process.env.APP_VERSION,
    ignoreClientErrors: opts.ignoreClientErrors || true
  }, opts || {})

  const counter = new Counter({
    name: 'log_events_total',
    help: 'Number of logging events that made it to the logs',
    labelNames: [ 'level', 'component', 'statusCode' ],
    registers: [ register ]
  })

  opts.counter = counter

  return compose([
    promMiddleware(opts),
    metricsHandler(opts)
  ])

}

module.exports = useMetrics
