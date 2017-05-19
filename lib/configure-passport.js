
const passport = require('passport')

passport.serializeUser(function(user, cb) {
  console.log(user)
  cb(null, user)
})

passport.deserializeUser(function(obj, cb) {
  console.log(obj)
  cb(null, obj)
})

//
// Main passport configuration function
//

module.exports = function(config) {
  return function(app) {
    app.use(passport.initialize())
    app.use(passport.session())

    for (var strategyConfig of config.strategies) {
      passport.use(new strategyConfig.strategy(strategyConfig.config,
        function(accessToken, refreshToken, profile, cb) {
          // In this example, the user's Facebook profile is supplied as the user
          // record.  In a production-quality application, the Facebook profile should
          // be associated with a user record in the application's database, which
          // allows for account linking and authentication with other identity
          // providers.
          console.log(profile)
          return cb(null, profile)
        }))

      app.get(config.loginBaseUrl + '/' + strategyConfig.urlName,
        passport.authenticate(strategyConfig.name, strategyConfig.authOptions))

      app.get(config.loginBaseUrl + '/' + strategyConfig.urlName + '/return',
        passport.authenticate(strategyConfig.name, strategyConfig.callbackOptions),
        function(req, res) {
          res.redirect('/')
        }
      )
    }
  }
}
