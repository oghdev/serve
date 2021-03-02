const { generateLogger, defaultTransport } = require('logger')

const level = process.env.LOG_LEVEL || 'info'
const defaultMeta = { component: 'server' }

const componentLogger = (meta) => {

  meta = Object.assign(
    {}, defaultMeta, meta || {}
  )

  return generateLogger(defaultTransport(), { meta, level })

}

const logger = componentLogger()

module.exports = { logger, componentLogger }
