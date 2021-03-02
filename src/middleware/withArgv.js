const withArgv = (fn, fields) => {

  fields = (fields || []).concat([ 'csrf', 'user', 'auth' ])

  return async (ctx, next) => {

    const argv = Object.assign(
      {},
      ctx.fields,
      ctx.files,
      ctx.params,
      fields.reduce((acc, field) => Object.assign(acc, { [field]: ctx[field] }))
    )

    await fn(argv)

    return next()

  }

}

module.exports = withArgv
