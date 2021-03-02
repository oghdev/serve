const withRequest = (opts) => (ctx, next) => {

  opts = opts || {}

  const fields = ctx.request.body || {}

  if (opts.allowQuery) {

    Object.assign(fields, ctx.request.query || {})

  }

  const files = ctx.request.files

  ctx.fields = fields
  ctx.files = files

  return next()

}

module.exports = withRequest
