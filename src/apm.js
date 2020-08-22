const ApmAgent = require('elastic-apm-node/lib/agent')

const apm = new ApmAgent()

const ApmInstrumentation = require('elastic-apm-node/lib/instrumentation')

const ins = new ApmInstrumentation(apm)

ins.start()

apm._instrumentation = ins

module.exports = apm
