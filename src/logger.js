const { generateLogger, defaultTransport } = require('logger')

const logger = generateLogger(defaultTransport, { level: process.env.LOG_LEVEL || 'info' })

module.exports = logger
