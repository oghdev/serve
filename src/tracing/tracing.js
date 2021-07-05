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
    .concat(opts.instrumentations, [ new KoaInstrumentation(), new HttpInstrumentation() ])
    .filter((i) => !!i)

  registerInstrumentations({ instrumentations, tracerProvider })

  tracerProvider.register()

  logger.debug('Loaded tracing modules', {
    instrumentations: instrumentations.map((i) => `${i.instrumentationName}/${i.instrumentationVersion}`),
    exporter: exporter.name
  })

  return (ctx, next) => {

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

    ctx.tracer = api.trace.getTracer(serviceName, serviceVersion)

    return next()

  }

}

const traceRoute = () => async (ctx, next) => {

  const requestId = ctx.requestId
  const params = ctx.params
  const path = ctx.path
  const method = ctx.method

  logger.debug('Tracing route params', { requestId, params, path })

  const route = params
    ? Object.entries(params).reduce((acc, [ key, val ]) => acc.replace(`/${val}`, `/:${key}`), path)
    : path

  const span = ctx.tracer.startSpan(`${method} ${route}`, { kind: api.SpanKind.SERVER })
  const { traceId } = span.spanContext()

  logger.debug('Tracing route', { requestId, traceId, route })

  await api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async () => {

    try {

      await next()

      span.setStatus({ code: api.StatusCode.OK })

    } catch (error) {

      span.setStatus({ code: api.StatusCode.ERROR, message: error.message })

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
