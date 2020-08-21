const logger = require('../logger')

const { serializeError } = require('serialize-error')

const extractToken = (opts) => {

  opts = Object.assign({
    logger: true,
    getUserFromToken: undefined
  }, opts || {})

  const getUserFromToken = opts.getUserFromToken

  if (!getUserFromToken || typeof getUserFromToken !== 'function') {

    throw new Error('getUserFromToken is not a function')

  }

  return async (ctx, next) => {

    const bearer = (ctx.request.header.authorization || '')
      .replace('Bearer', '')
      .trim()

    const query = (ctx.request.query.access_token || '')
      .trim()

    const bearerToken = bearer || query

    if (bearerToken) {

      try {

        const { user, claims } = await getUserFromToken(bearerToken)

        ctx.user = user
        ctx.claims = claims
        ctx.token = token

      } catch (err) {

        if (opts.logger) {

          const error = serializeError(err)

          logger.info('Unable to assume jwt token', { error })

        }

      }

    }

    await next()

  }

}

module.exports = extractToken
