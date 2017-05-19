//
// Server module
//

const util = require('util')

const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
// const cookieParser = require('cookie-parser')
const session = require('express-session');

var now = require("performance-now")

const mongoose = require('mongoose')
const RedisStore = require('connect-redis')(session)

const respond = require('./respond')
const routes = require('./routes')
const configurePassport = require('./configure-passport')
const statusCodes = require('./statuscodes')

const Server = function(config) {
  config.printLog = config.printLog || false
  config.host = config.host || process.env.HOST || 'localhost'
  config.port = config.port || process.env.PORT || 3000

  config.mongoDB = config.mongoDB || {}
  config.mongoDB.host = config.mongoDB.host || process.env.MONGODB_HOST || 'localhost'
  config.mongoDB.port = config.mongoDB.port || process.env.MONGODB_PORT || 27017
  config.mongoDB.database = config.mongoDB.database || process.env.MONGODB_DATABASE || 'test'
  config.mongoDB.options = config.mongoDB.options || {}

  config.redis = config.redis || {}
  config.redis.address = config.redis.address || process.env.REDIS_ADDRESS || 'localhost'
  config.redis.port = config.redis.port || process.env.REDIS_PORT || 6379
  config.redis.port = config.redis.port || process.env.REDIS_PORT || 6379

  const Server = function() {
    //
    // Initialise Express app
    //

    this.app = express()
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.use(bodyParser.json())
    this.app.use(compression())

    // this.app.use(cookieParser)
    const sessionConfig = Object.assign(config.session, {
      store: new RedisStore(config.redis)
    })
    this.app.use(session(sessionConfig))

    // Performance measurement
    this.app.use(function (req, res, next) {
      if (!config.printLog) {
        next()
      } else {
        var dateTime = new Date(Date.now())
        var start = now()

        next()

        var end = now()

        var statusCode = 200
        if (!!res.statusCode) {
          statusCode = res.statusCode
        } else {
          for (var key in statusCodes) {
            if (statusCodes[key] == res.status().statusMessage) {
              statusCode = key
              break
            }
          }
        }

        console.log(util.format('%d %s %s %s %s',
          statusCode,
          req.method,
          req.url,
          String((end - start).toFixed(3)) + 'ms',
          dateTime))
      }
    })

    this.connection = mongoose.createConnection()

    //
    // Methods
    //

    this.addDefaultRoute = function(handler) {
      handler = typeof handler !== 'undefined' ? handler : function(req, res) {
        respond.sendError404(res)
      }

      this.app.all('*', handler)
    }

    this.makeRoutes = function(props, arr) {
      props.model = this.connection.model(props.id, props.schema)
      routes.makeRoutes(this.app, props, config.rbac, arr)
    }

    this.add = function(fn) {
      fn(this.app)
    }

    this.configurePassport = function(options) {
      configurePassport(options)(this.app)
    }

    this.run = function() {
      const app = this.app

      this.connection.on('error', console.error.bind(console, 'connection error:'))
      this.connection.once('open', function callback() {
        app.listen(config.port, config.host, function() {
          if (config.printLog) {
            console.log('App is listening to http://' +
              String(config.host) + ':' + String(config.port))
          }
        })
      })

      this.connection.open(config.mongoDB.host, config.mongoDB.database, config.mongoDB.port, config.mongoDB.options)
    }
  }

  return new Server()
}

module.exports = Server
