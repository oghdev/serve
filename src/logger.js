const { generateLogger, componentLogger } = require('logger')

const logger = componentLogger()

module.exports = { logger, componentLogger }
