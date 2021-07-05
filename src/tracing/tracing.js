const api = require('@opentelemetry/api')

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { Resource } = require('@opentelemetry/resources')
const { ResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

const { componentLogger } = require('../logger')
const logger = componentLogger({ subcomponent: 'tracing' })

const tracingMiddleware = (opts) => {

  opts = Object.assign({
    serviceName: process.env.APP_NAME,
    serviceVersion: process.env.APP_VERSION,
    exporter: undefined,
    instrumentations: [],
    tags: {}
  }, opts || {})

  const exporter = opts.exporter

  if (!exporter) {

    throw new Error('Invalid OTEL exporter')

  }

  const serviceName = opts.serviceName
  const serviceVersion = opts.serviceVersion

  const tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [ResourceAttributes.SERVICE_NAME]: serviceName,
      [ResourceAttributes.SERVICE_VERSION]: serviceVersion
    })
  })

  const defaultProcessor = new SimpleSpanProcessor(exporter)

  tracerProvider.addSpanProcessor(opts.processor || defaultProcessor)

  const instrumentations = []
    .concat([ new HttpInstrumentation(), new KoaInstrumentation() ], opts.instrumentations)
    .filter((i) => !!i)

  registerInstrumentations({ instrumentations, tracerProvider })

  tracerProvider.register()

  logger.debug('Loaded tracing modules', {
    instrumentations: instrumentations.map((i) => `${i.instrumentationName}/${i.instrumentationVersion}`),
    exporter: exporter.name
  })

  return async (ctx, next) => {

    ctx.tracer = api.trace.getTracer(serviceName, serviceVersion)

    await next()

    const requestId = ctx.requestId

    if (requestId) {

      const span = getCurrentSpan()

      if (!span) {

        logger.debug('No captured trace for request', { requestId })

        return next()

      }

      const { traceId } = span.spanContext()

      span.setAttribute('request.date', new Date())
      span.setAttribute('request.requestId', ctx.requestId)
      span.setAttribute('request.traceId', traceId)

      logger.debug('Captured trace for request', { requestId, traceId })

    }

  }

}

const traceRoute = () => async (ctx, next) => {

  const requestId = ctx.requestId
  const method = ctx.method
  const path = ctx.originalUrl.split('?')[0]
  const query = ctx.query
  const params = ctx.params

  const span = getCurrentSpan()
  const traceId = span.spanContext().traceId

  logger.debug('Tracing route params', { requestId, traceId, method, params, path })

  const route = params
    ? Object.entries(params).reduce((acc, [ key, val ]) => acc.replace(`/${val}`, `/:${key}`), path)
    : path

  span.setAttribute('http.route', route)
  span.setAttribute('http.routeParams', JSON.stringify(params))
  span.setAttribute('http.queryParams', JSON.stringify(query))

  logger.debug('Tracing route', { requestId, traceId, route })

  await api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async () => {

    try {

      await next()

      span.setStatus({ code: api.SpanStatusCode.OK })

    } catch (error) {

      span.setStatus({ code: api.SpanStatusCode.ERROR, message: error.message })

    }

  })

}

const getCurrentSpan = () => api.trace.getSpan(api.context.active())

module.exports = {
  tracingMiddleware,
  traceRoute,
  getCurrentSpan,
  api
}
