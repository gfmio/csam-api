//
// Routes module
//

const respond = require('./respond')

const checkAccess = function(resource, rbacInfo) {
  return function(req, res, next) {
    // console.log(resource)
    // console.log(req.session.userId)
    // console.log(req.session.roles)
    req.session.roles = req.session.roles || ['guest']
    // req.session.roles.push('admin')

    var allowed = false

    for (var role of req.session.roles) {
      var rolePermissions = Object.assign({}, rbacInfo.permissions, rbacInfo.roles[role])
      allowed = (allowed || (!!rolePermissions[resource]))
    }

    if (allowed) {
      next()
    } else {
      respond.sendError401(res)
    }
  }
}

const makeRoutes = function (app, props, rbac, arr) {
  arr = arr || [true, true, true, true, true, true, false, true, true, true]
  if (arr[0]) { collection.get(app, props, rbac) }
  if (arr[1]) { collection.post(app, props, rbac) }
  if (arr[2]) { collection.put(app, props, rbac) }
  if (arr[3]) { collection.patch(app, props, rbac) }
  if (arr[4]) { collection.delete(app, props, rbac) }

  if (arr[5]) { item.get(app, props, rbac) }
  if (arr[6]) { item.post(app, props, rbac) }
  if (arr[7]) { item.put(app, props, rbac) }
  if (arr[8]) { item.patch(app, props, rbac) }
  if (arr[9]) { item.delete(app, props, rbac) }
}

var collection = {}
var item = {}

collection.get = function (app, props, rbac) {
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:collection:get'
  var path = props.path || '/' + props.id.toLowerCase() + 's'
  var idField = props.idField || '_id'
  var model = props.model

  app.get(path, checkAccess(resourceId, rbac), function (req, res) {
    searchObject = req.query

    model.find(searchObject, function (err, results) {
      if (err) {
        respond.sendError500(res)
      } else {
        respond.send(res, { body: results })
      }
    })
  })
}

collection.post = function (app, props, rbac) {
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:collection:post'
  var path = props.path || '/' + props.id.toLowerCase() + 's'
  var idField = props.idField || '_id'
  var model = props.model

  app.post(path, checkAccess(resourceId, rbac), function (req, res) {
    var newObject = new model(req.body)

    newObject.save(function (err) {
      if (err) {
        respond.sendError400(res, [err])
      } else {
        respond.send(res, { body: newObject })
      }
    })
  })
}

collection.put = function (app, props, rbac) {
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:collection:put'
  var path = props.path || '/' + props.id.toLowerCase() + 's'
  var idField = props.idField || '_id'
  var model = props.model

  var searchObject = {}
  // searchObject[idField] = req.params.id
  const options = { new: true }

  app.put(path, checkAccess(resourceId, rbac), function (req, res) {
    model.updateMany(searchObject, req.body, options, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

collection.patch = function (app, props, rbac) {
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:collection:patch'
  var path = props.path || '/' + props.id.toLowerCase() + 's'
  var idField = props.idField || '_id'
  var model = props.model

  var searchObject = {}
  // searchObject[idField] = req.params.id
  const options = { new: true }

  app.patch(path, checkAccess(resourceId, rbac), function (req, res) {
    model.updateMany(searchObject, req.body, options, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

collection.delete = function (app, props, rbac) {
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:collection:delete'
  var path = props.path || '/' + props.id.toLowerCase() + 's'
  var idField = props.idField || '_id'
  var model = props.model

  var searchObject = {}
  // searchObject[idField] = req.params.id

  app.delete(path, checkAccess(resourceId, rbac), function (req, res) {
    model.deleteMany(searchObject, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

item.get = function (app, props, rbac) {
  var path = props.path || '/' + props.id.toLowerCase() + 's/:id'
  var idField = props.idField || '_id'
  var model = props.model
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:item:get'

  app.get(path, checkAccess(resourceId, rbac), function (req, res) {
    var searchObject = {}
    searchObject[idField] = req.params.id

    model.findOne(searchObject, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

item.post = function (app, props, rbac) {
  var path = props.path || '/' + props.id.toLowerCase() + 's/:id'
  var idField = props.idField || '_id'
  var model = props.model
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:item:post'

  app.post(path, checkAccess(resourceId, rbac), function (req, res) {
    respond.sendError405(res)
  })
}

item.put = function (app, props, rbac) {
  var path = props.path || '/' + props.id.toLowerCase() + 's/:id'
  var idField = props.idField || '_id'
  var model = props.model
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:item:put'

  app.put(path, checkAccess(resourceId, rbac), function (req, res) {
    var searchObject = {}
    searchObject[idField] = req.params.id
    const options = { new: true }

    model.findOneAndUpdate(searchObject, req.body, options, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

item.patch = function (app, props, rbac) {
  var path = props.path || '/' + props.id.toLowerCase() + 's/:id'
  var idField = props.idField || '_id'
  var model = props.model
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:item:patch'

  app.patch(path, checkAccess(resourceId, rbac), function (req, res) {
    var searchObject = {}
    searchObject[idField] = req.params.id
    const options = { new: true }

    model.findOneAndUpdate(searchObject, req.body, options, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

item.delete = function (app, props, rbac) {
  var path = props.path || '/' + props.id.toLowerCase() + 's/:id'
  var idField = props.idField || '_id'
  var model = props.model
  var resourceId = props.resourceId || props.id.toLowerCase() + 's:item:delete'

  app.delete(path, checkAccess(resourceId, rbac), function (req, res) {
    var searchObject = {}
    searchObject[idField] = req.params.id

    model.findOneAndRemove(searchObject, function (err, result) {
      if (err) {
        if (err.name == 'CastError') {
          respond.sendError404(res)
        } else {
          respond.sendError400(res, [err])
        }
      } else {
        if (result === null) {
          respond.sendError404(res)
        } else {
          respond.send(res, { body: result })
        }
      }
    })
  })
}

module.exports = {
  makeRoutes: makeRoutes,
  collection: collection,
  item: item
}
