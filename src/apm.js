require('elastic-apm-node/lib/instrumentation/modules/apollo-server-core')
require('elastic-apm-node/lib/instrumentation/modules/bluebird')
require('elastic-apm-node/lib/instrumentation/modules/cassandra-driver')
require('elastic-apm-node/lib/instrumentation/modules/elasticsearch')
require('elastic-apm-node/lib/instrumentation/modules/express')
require('elastic-apm-node/lib/instrumentation/modules/express-graphql')
require('elastic-apm-node/lib/instrumentation/modules/express-queue')
require('elastic-apm-node/lib/instrumentation/modules/fastify')
require('elastic-apm-node/lib/instrumentation/modules/finalhandler')
require('elastic-apm-node/lib/instrumentation/modules/generic-pool')
require('elastic-apm-node/lib/instrumentation/modules/graphql')
require('elastic-apm-node/lib/instrumentation/modules/handlebars')
require('elastic-apm-node/lib/instrumentation/modules/hapi')
require('elastic-apm-node/lib/instrumentation/modules/http')
require('elastic-apm-node/lib/instrumentation/modules/https')
require('elastic-apm-node/lib/instrumentation/modules/http2')
require('elastic-apm-node/lib/instrumentation/modules/ioredis')
require('elastic-apm-node/lib/instrumentation/modules/jade')
require('elastic-apm-node/lib/instrumentation/modules/knex')
require('elastic-apm-node/lib/instrumentation/modules/koa')
require('elastic-apm-node/lib/instrumentation/modules/koa-router')
require('elastic-apm-node/lib/instrumentation/modules/memcached')
require('elastic-apm-node/lib/instrumentation/modules/mimic-response')
require('elastic-apm-node/lib/instrumentation/modules/mongodb-core')
require('elastic-apm-node/lib/instrumentation/modules/mongodb')
require('elastic-apm-node/lib/instrumentation/modules/mysql')
require('elastic-apm-node/lib/instrumentation/modules/mysql2')
require('elastic-apm-node/lib/instrumentation/modules/pg')
require('elastic-apm-node/lib/instrumentation/modules/pug')
require('elastic-apm-node/lib/instrumentation/modules/redis')
require('elastic-apm-node/lib/instrumentation/modules/restify')
require('elastic-apm-node/lib/instrumentation/modules/tedious')
require('elastic-apm-node/lib/instrumentation/modules/ws')

const ApmAgent = require('elastic-apm-node/lib/agent')

const apm = new ApmAgent()

apm._instrumentation._agent = apm
apm._instrumentation._started = true
apm._instrumentation._startHook()
apm._instrumentation._started = false

module.exports = apm
