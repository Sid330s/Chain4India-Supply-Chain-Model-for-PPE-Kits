
'use strict'

const _ = require('lodash')
const db = require('.')

const CERTIFIER_SCHEMA = {
    pincode: String,
    address: String,
    publicKey: String,
    '*': null
}

const UPDATE_SCHEMA = _.mapKeys(CERTIFIER_SCHEMA, (_, key) => {
  if (key === '*' || key[0] === '?') return key
  return '?' + key
})

const query = query => db.queryTable('certifiers', query)

const insert = certifier => {
  return db.validate(certifier, CERTIFIER_SCHEMA)
    .then(() => db.insertTable('certifiers', certifier))
    .catch(err => {
        return db.modifyTable('certifiers', certifiers => {
          return certifiers.get(certifier.publicKey).delete()
        })
          .then(() => { throw err })
      })
}

const update = (publicKey, changes) => {
  return db.validate(changes, UPDATE_SCHEMA)
    .then(() => db.updateTable('certifiers', publicKey, changes))
    .then(results => {
      if (results.unchanged === 1) {
        return db.queryTable('certifiers', certifiers => certifiers.get(publicKey), false)
      }

      const newCertifier = results.changes[0].new_val

      return newCertifier
    })
    .catch(err => { throw err })
}

module.exports = {
  query,
  insert,
  update
}