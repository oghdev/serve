const healthcheck = require('maikai')
const compose = require('koa-compose')

const livenessCheck = healthcheck({ path: '/livez' })
const readinessCheck = healthcheck({ path: '/readyz' })

const healthcheckMiddleware = () => compose([ livenessCheck, readinessCheck ])

module.exports = {
  livenessCheck,
  readinessCheck,
  healthcheckMiddleware
}
