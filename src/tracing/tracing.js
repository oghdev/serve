const api = require('@opentelemetry/api')
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { NodeTracerProvider } = require('@opentelemetry/node')
const { BatchSpanProcessor } = require('@opentelemetry/tracing')
const { ZoneContextManager } = require('@opentelemetry/context-zone')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const { KoaInstrumentation } = require('@opentelemetry/instrumentation-koa')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

const contextManager = new ZoneContextManager()
const tracerProvider = new NodeTracerProvider()

const tracingMiddleware = (opts) => {

  opts = Object.assign({
    exporter: 'jaeger',
    instrumentations: []
  }, opts || {})

  const serviceName = opts.serviceName

  const exporter = opts.exporter === 'jaeger'
    ? new JaegerExporter({ serviceName })
    : new ZipkinExporter({ serviceName })

  const defaultProcessor = new BatchSpanProcessor(exporter)

  tracerProvider.addSpanProcessor(opts.processor || defaultProcessor)

  const instrumentations = []
    .concat(opts.instrumentation, [ new KoaInstrumentation(), new HttpInstrumentation() ])

  registerInstrumentations({ instrumentations, tracerProvider })

  tracerProvider.register({ contextManager })

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
  contextManager,
  tracingMiddleware,
  getCurrentSpan
}
