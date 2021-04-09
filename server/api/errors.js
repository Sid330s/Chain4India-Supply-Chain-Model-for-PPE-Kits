
'use strict'

class BadRequest extends Error {
  constructor (message) {
    super(message)
    this.status = 400
  }
}

class Unauthorized extends Error {
  constructor (message) {
    super(message)
    this.status = 401
  }
}

class NotFound extends Error {
  constructor (message) {
    super(message)
    this.status = 404
  }
}

class InternalServerError extends Error {
  constructor (message) {
    super(message)
    this.status = 500
  }
}

module.exports = {
  BadRequest,
  Unauthorized,
  NotFound,
  InternalServerError
}
