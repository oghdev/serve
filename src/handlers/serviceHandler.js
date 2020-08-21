const serviceHandler = (fn, opts) => {

  opts = Object.assign({
    allowQuery: false,
    useWrapper: true,
    headers: {}
  }, opts || {})

  let argv

  return async (ctx) => {

    argv = Object.assign({}, ctx.request.body || {})

    if (opts.allowQuery) {

      argv = Object.assign(argv, ctx.request.query || {})

    }

    argv = Object.assign(argv, ctx.request.files || {})

    argv = Object.assign(argv, ctx.params || {})

    argv = Object.assign(argv, { user: ctx.user, token: ctx.token })

    const data = await fn(argv, ctx)

    for (const [ key, value ] of Object.entries(opts.headers)) {

      ctx.response.set(key, value)

    }

    if (data.redirect) {

      ctx.redirect(data.redirect)

      return

    }

    const status = 200

    ctx.status = status

    if (opts.useWrapper) {

      ctx.body = { status, data }

    } else {

      ctx.body = data

    }

  }

}

module.exports = serviceHandler
