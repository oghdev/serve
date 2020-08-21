const { createServer, createApp, createRouter } = require('./src/app')

const middleware = require('./src/middleware')
const handlers = require('./src/handlers')

module.exports = {
  createServer,
  createApp,
  createRouter,
  middleware,
  handlers
}
