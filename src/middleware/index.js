const accessLog = require('./accessLog')
const bodyParser = require('./bodyParser')
const compress = require('./compress')
const context = require('./context')
const cors = require('./cors')
const errorHandler = require('./errorHandler')
const extractToken = require('./extractToken')
const useApm = require('./useApm')

const withArgv = require('./withArgv')
const withRequest = require('./withRequest')
const withRequestSchema = require('./withRequestSchema')
const withResponse = require('./withResponse')

module.exports = {
  accessLog,
  bodyParser,
  compress,
  context,
  cors,
  errorHandler,
  extractToken,
  useApm,
  withArgv,
  withRequest,
  withRequestSchema,
  withResponse
}
