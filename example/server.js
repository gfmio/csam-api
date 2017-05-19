//
// Simple example server
//

const config = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3001,
  printLog: true,

  mongoDB: {
    host: process.env.MONGODB_HOST || '0.0.0.0',
    port: process.env.MONGODB_PORT || 27017,
    database: process.env.MONGODB_DATABASE || 'test',
    options: {}
  }, // see also http://mongoosejs.com/docs/connections.html
  redis: {
    host: process.env.REDIS_HOST || '0.0.0.0',
    port: process.env.REDIS_PORT || 6379
  },
  session: {
    key: 'express.sid',
    secret: 'crypto cat',

    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      httpOnly: true, // The cookie only accessible by the web server
      signed: true // Indicates if the cookie should be signed
    }
  },

  passport: {
    loginBaseUrl: '/login',
    strategies: [{
      name: 'google',
      strategy: require('passport-google-oauth20').Strategy,
      urlName: 'google',
      authOptions: {
        scope: ['profile']
      },
      callbackOptions: {
        successRedirect: '/',
        failureRedirect: '/'
      },
      config: {
        clientID: process.env.GOOGLE_CLIENT_ID || 'CLIENT_ID',
        clientSecret: process.env.GOOGLE_SECRET_ID || 'CLIENT_SECRET',
        callbackURL: '/login/google/return'
      }
    }]
  },

  rbac: {
    roles: {
      guest: {
        'cats:collection:get': true,
        'cats:collection:post': true,
        'cats:collection:put': true,
        'cats:collection:patch': true,
        'cats:collection:delete': true,
        'cats:item:get': true,
        'cats:item:put': true,
        'cats:item:patch': true,
        'cats:item:delete': true
      }
    },
    permissions: {
      'cats:collection:get': false,
      'cats:collection:post': false,
      'cats:collection:put': false,
      'cats:collection:patch': false,
      'cats:collection:delete': false,
      'cats:item:get': false,
      'cats:item:post': false,
      'cats:item:put': false,
      'cats:item:patch': false,
      'cats:item:delete': false
    }
  }
}

var server = require('csam-api').Server(config)
server.configurePassport(config.passport)

//
// Add models
//

const catSchema = {
  name: { type: String, required: true }
}

server.makeRoutes({
  schema: catSchema,
  id: 'Cat'
})

// Add default 404 handler
server.addDefaultRoute()

// Run the server
server.run()
