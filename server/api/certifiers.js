
'use strict'

const _ = require('lodash')
const db = require('../db/certifiers')
const agents = require('../db/agents')
const users = require('./users')
const { BadRequest } = require('./errors')

const USER_OMIT_OPTION = ['pincode', 'address',]
const CERTIFIER_PICK_OPTIONS = ['pincode', 'address', 'publicKey']

const createCertifier = certifier => {
  return Promise.resolve()
    .then(() => {
      return agents.fetch(certifier.publicKey, null)
        .catch(() => {
          throw new BadRequest('Public key must match an Agent on blockchain')
        })
    })
    .then(() => {
      return db.insert(certifier)
        .catch(err => { throw new BadRequest(err.message) })
    })
    .catch(err => { throw err })
}

const update = (changes, { authedKey }) => {
  return Promise.resolve()
    .then(() => db.update(authedKey, changes))
    .catch(err => { throw err })
}


const create = incomingData => {
  return Promise.resolve()
    .then(() => {
      createCertifier(_.pick(incomingData, CERTIFIER_PICK_OPTIONS))
      return users.create(_.omit(incomingData, USER_OMIT_OPTION))
    })
    .catch(err => { throw err })
}

module.exports = {
  create,
  update
}