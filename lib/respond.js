
const send = function(res, props) {
  props.code = typeof props.code !== 'undefined' ? props.code : 200
  props.body = typeof props.body !== 'undefined' ? props.body : {}

  res.status(props.code).type('application/json').json(props.body)
}

const sendError = function(res, code, message, errors) {
  var resultObject = {
    error: {
      code: code,
      message: message
    }
  }

  if (errors !== undefined) {
    resultObject.error.errors = errors
  }

  send(res, { code: code, body: resultObject})
}

var resultObject = {
  send: send,
  sendError: sendError
}

const httpStatusCodes = require('./statuscodes')

for (const statusCode in httpStatusCodes) {
  const msg = httpStatusCodes[statusCode]

  resultObject['sendError' + String(statusCode)] = function(res, errors) {
    sendError(res, statusCode, msg, errors)
  }
}

module.exports = resultObject
