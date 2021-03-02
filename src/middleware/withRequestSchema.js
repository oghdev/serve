const withArgv = require('./withArgv')

const withRequestSchema = (schema) => withArgv((argv) => schema.validateAsync(argv))

module.exports = withRequestSchema
