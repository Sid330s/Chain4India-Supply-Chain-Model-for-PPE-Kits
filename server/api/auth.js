
'use strict'

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const users = require('../db/users')
const { BadRequest, Unauthorized } = require('./errors')
const config = require('../system/config')

const SALT_ROUNDS = 10
const SECRET = config.JWT_SECRET

const hashPassword = pass => bcrypt.hash(pass, SALT_ROUNDS)

const createToken = payload => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  })
}

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) reject(err)
      else resolve(payload)
    })
  })
}

const authorize = ({ username, password }) => {
  if (!username || !password) {
    const message = 'Authorization requires username and password'
    return Promise.reject(new BadRequest(message))
  }

  return users.query(users => users.filter({ username }))
    .then(matches => {
      if (matches.length === 0) throw new Error()
      const user = matches[0]

      return bcrypt.compare(password, user.password)
        .then(passValid => {
          if (!passValid) throw new Error()
          return createToken(user.publicKey)
        })
        .then(token => ({
          authorization: token,
          encryptedKey: user.encryptedKey
        }))
    })
    .catch(() => { throw new Unauthorized('Authorization Failed') })
}

module.exports = {
  hashPassword,
  createToken,
  verifyToken,
  authorize
}
