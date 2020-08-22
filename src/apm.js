const path = require('path')
const requireContext = require('require-context')

requireContext(path.resolve(__dirname, '../node_modules/elastic-apm-node/lib/instrumentation/modules'), true, /\.js$/)

const ApmAgent = require('elastic-apm-node/lib/agent')

const apm = new ApmAgent()

const ApmInstrumentation = require('elastic-apm-node/lib/instrumentation')

const ins = new ApmInstrumentation(apm)

apm._started = true
ins._startHook()
apm._started = false

apm._instrumentation = ins

module.exports = apm
