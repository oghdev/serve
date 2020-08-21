const accessLog = require('./accessLog')
const bodyParser = require('./bodyParser')
const compress = require('./compress')
const errorHandler = require('./errorHandler')
const extractToken = require('./extractToken')

module.exports = {
  accessLog,
  bodyParser,
  compress,
  errorHandler,
  extractToken
}
