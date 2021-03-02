const withArgv = require('./withArgv')

const withResponse = (fn, opts) => {

  return async (ctx) => {

    await new Promise((resolve, reject) => withArgv(async (argv) => {

      const data = await fn(argv)

      ctx.status = 200
      ctx.body = { data }

    })(ctx, resolve).catch(reject))

  }

}

module.exports = withResponse
