const api = require('@opentelemetry/api')

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

const tracerProvider = new NodeTracerProvider()

const tracingMiddleware = (opts) => {

  opts = Object.assign({
    exporter: 'jaeger',
    instrumentations: [],
    serviceName: process.env.APP_NAME,
    serviceVersion: process.env.APP_VERSION
  }, opts || {})

  const { serviceVersion, serviceName } = opts

  const tags = { serviceName, serviceVersion }

  const exporter = opts.exporter === 'jaeger'
    ? new JaegerExporter({ serviceName, tags })
    : new ZipkinExporter({ serviceName, tags })

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
  tracerProvider,
  tracingMiddleware,
  getCurrentSpan
}
