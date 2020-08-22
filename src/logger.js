const { generateLogger, defaultTransport } = require('logger')

const meta = { component: 'server' }
const level = process.env.LOG_LEVEL || 'info'

const logger = generateLogger(defaultTransport, { meta, level })

module.exports = logger
