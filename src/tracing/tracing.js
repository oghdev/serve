const api = require('@opentelemetry/api')

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { Resource } = require('@opentelemetry/resources')
const { ResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

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

  return (ctx, next) => {

    if (ctx.requestId) {

      const span = getCurrentSpan()
      const { traceId } = span.spanContext()

      span.setAttribute('request.date', new Date())
      span.setAttribute('request.requestId', ctx.requestId)
      span.setAttribute('request.traceId', traceId)

      ctx.logger.debug('Captured trace for request', { traceId })

    }

    ctx.tracer = api.trace.getTracer(serviceName)

    return next()

  }

}

const getCurrentSpan = () => api.trace.getSpan(api.context.active())

module.exports = {
  tracingMiddleware,
  getCurrentSpan
}
