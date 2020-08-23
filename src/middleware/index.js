const accessLog = require('./accessLog')
const bodyParser = require('./bodyParser')
const compress = require('./compress')
const context = require('./context')
const errorHandler = require('./errorHandler')
const extractToken = require('./extractToken')
const useApm = require('./useApm')

module.exports = {
  accessLog,
  bodyParser,
  compress,
  context,
  errorHandler,
  extractToken,
  useApm
}
