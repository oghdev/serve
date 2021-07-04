const { createServer, createApp, createRouter } = require('./src/app')
const { logger, componentLogger } = require('./src/logger')

const middleware = require('./src/middleware')
const handlers = require('./src/handlers')

module.exports = {
  createServer,
  createApp,
  createRouter,
  logger,
  componentLogger,
  middleware,
  handlers
}
