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
      .replace('bearer', '')
      .replace('jwt', '')
      .replace('Bearer', '')
      .replace('JWT', '')
      .trim()

    const query = (ctx.request.query.access_token || '')
      .trim()

    const bearerToken = bearer || query

    if (bearerToken) {

      const { user, claims } = await getUserFromToken(bearerToken)

      ctx.user = user
      ctx.claims = claims
      ctx.token = bearerToken

    }

    await next()

  }

}

module.exports = extractToken
