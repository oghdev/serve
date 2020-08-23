const apm = require('../apm')
const { logger, componentLogger  } = require('../logger')

const useApm = (opts) => {

  opts = Object.assign({
    serviceName: opts.serviceName || process.env.APP_NAME,
    serviceVersion: opts.serviceVersion || process.env.APP_VERSION,
    serverUrl:  opts.serverUrl || process.env.APM_SERVER_URL,
    secretToken: opts.secretToken || process.env.APM_SERVER_TOKEN,
    apiRequestTime: opts.apiRequestTime || process.env.APM_REQUEST_TIME || '1s',
    metricsInterval: opts.metricsInterval || process.env.APM_METRICS_INTERVAL || '30s',
    loggerInstance: opts.loggerInstance || componentLogger({ subcomponent: 'apm-agent' }),
    ignoreClientErrors: opts.ignoreClientErrors || true
  }, opts || {})

  const config = {
    serviceName: opts.serviceName,
    serviceVersion: opts.serviceVersion,
    serverUrl: opts.serverUrl,
    secretToken: opts.secretToken,
    apiRequestTime: opts.apiRequestTime,
    metricsInterval: opts.metricsInterval,
    logger: opts.loggerInstance,
    active: true,
    captureExceptions: false
  }

  if (!config.serverUrl) {

    throw new Error('option serverUrl missing')

  }

  apm.start(config)

  return async (ctx, next) => {

    const requestId = ctx.requestId

    const onError = (error) => {

      if (opts.ignoreClientErrors && error.statusCode && error.statusCode < 499) {

        return

      }

      try {

        apm.captureError(error, {
          request: ctx.req,
          response: ctx.res,
          custom: { requestId },
          labels: { requestId }
        })

        ctx.logger.info('Error sent to apm', { error })

      } catch (error) {

        ctx.logger.error('Unable to send error to apm', { error })

      }

    }

    ctx.on('error', onError)

    try {

      apm.setTransactionName(`${ctx.method} ${ctx.path}`)
      apm.setLabel('requestId', requestId)

      if (ctx.user) {

        const user = {
          id: ctx.user.id,
          email: ctx.user.email,
          username: ctx.user.username
        }

        apm.setUserContext(user)

      }

      await next()

    } finally {

      ctx.off('error', onError)

    }

  }

}

module.exports = useApm
