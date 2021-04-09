
'use strict'

const _ = require('lodash')
const db = require('../db/manufacturers')
const agents = require('../db/agents')
const users = require('./users')
const { BadRequest } = require('./errors')

const USER_OMIT_OPTION = ['pincode', 'gst_no', 'contact_no']
const MANUFACTURER_PICK_OPTION = ['pincode', 'gst_no', 'contact_no', 'publicKey']

const createManufacturer = manufacturer => {
  return Promise.resolve()
    .then(() => {
      return agents.fetch(manufacturer.publicKey, null)
        .catch(() => {
          throw new BadRequest('Public key must match an Agent on blockchain')
        })
    })
    .then(() => {
      return db.insert(manufacturer)
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
      createManufacturer(_.pick(incomingData, MANUFACTURER_PICK_OPTION))
      return users.create(_.omit(incomingData, USER_OMIT_OPTION))
    })
    .catch(err => { throw err })
}

module.exports = {
  create,
  update
}