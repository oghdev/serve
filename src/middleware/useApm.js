const apm = require('../apm')
const logger = require('../logger')

const useApm = (opts) => {

  opts = Object.assign({
    serviceName: opts.serviceName || process.env.APP_NAME,
    serviceVersion: opts.serviceVersion || process.env.APP_VERSION,
    serverUrl:  opts.serverUrl || process.env.APM_SERVER_URL,
    secretToken: opts.secretToken || process.env.APM_SERVER_TOKEN,
    apiRequestTime: opts.apiRequestTime || '30s',
    metricsInterval: opts.metricsInterval || '10s',
    loggerInstance: opts.loggerInstance || logger.child({ component: 'apm-agent' }),
    ignoreClientErrors: opts.ignoreClientErrors || true
  })

  apm.start({
    serviceName: opts.serviceName,
    serviceVersion: opts.serviceVersion,
    serverUrl: opts.serverUrl,
    secretToken: opts.secretToken,
    apiRequestTime: opts.apiRequestTime,
    metricsInterval: opts.metricsInterval,
    logger: opts.loggerInstance
  })

  apm._instrumentation.agent._transport = apm._transport

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

      } catch (error) {

        logger.error('Unable to send error to apm', { error })

      }

    }

    ctx.on('error', onError)

    if (ctx.user) {

      const user = {
        id: ctx.user.id,
        email: ctx.user.email,
        username: ctx.user.username
      }

      apm.setUserContext(user)

    }

    await next()

  }

}

module.exports = useApm
