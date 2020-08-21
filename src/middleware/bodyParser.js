const parser = require('koa-body')

const bodyParser = (opts) => {

  opts = Object.assign({
    multipart: true,
    formLimit: '100mb'
  }, opts || {})

  return parser({
    multipart: opts.multipart,
    formLimit: opts.formLimit,
    formidable: { keepExtensions: true }
  })

}

module.exports = bodyParser
