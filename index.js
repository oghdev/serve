require('./src/apm')

const { createServer, createApp, createRouter } = require('./src/app')

const middleware = require('./src/middleware')
const handlers = require('./src/handlers')

const { logger, componentLogger } = require('logger')

module.exports = {
  createServer,
  createApp,
  createRouter,
  middleware,
  handlers,
  logger,
  componentLogger
}
