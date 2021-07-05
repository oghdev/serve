const api = require('@opentelemetry/api')

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { Resource } = require('@opentelemetry/resources')
const { ResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

const tracingMiddleware = (opts) => {

  opts = Object.assign({
    serviceName: process.env.APP_NAME,
    serviceVersion: process.env.APP_VERSION,
    exporter: 'jaeger',
    instrumentations: [],
    tags: {}
  }, opts || {})

  const serviceName = opts.serviceName
  const serviceVersion = opts.serviceVersion

  const tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [ResourceAttributes.SERVICE_NAME]: serviceName,
      [ResourceAttributes.SERVICE_VERSION]: serviceVersion
    })
  })

  const tags = opts.tags

  const exporter = opts.exporter === 'jaeger'
    ? new JaegerExporter({ tags })
    : new ZipkinExporter({ tags })

  const defaultProcessor = new SimpleSpanProcessor(exporter)

  tracerProvider.addSpanProcessor(opts.processor || defaultProcessor)

  const instrumentations = []
    .concat(opts.instrumentation, [ new KoaInstrumentation(), new HttpInstrumentation() ])
    .filter((i) => !!i)

  registerInstrumentations({ instrumentations, tracerProvider })

  tracerProvider.register()

  return (ctx, next) => {

    if (ctx.requestId) {

      const span = getCurrentSpan()

      span.setAttribute('Date', new Date())
      span.setAttribute('RequestID', ctx.requestId)

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
