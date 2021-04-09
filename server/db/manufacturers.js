
'use strict'

const _ = require('lodash')
const db = require('.')

const MANUFACTURER_SCHEMA = {
  pincode: String,
  gst_no: String,
  contact_no: String,
  publicKey: String,
  '*': null
}

const UPDATE_SCHEMA = _.mapKeys(MANUFACTURER_SCHEMA, (_, key) => {
  if (key === '*' || key[0] === '?') return key
  return '?' + key
})

const query = query => db.queryTable('manufacturers', query)

const insert = manufacturer => {
  return db.validate(manufacturer, MANUFACTURER_SCHEMA)
    .then(() => db.insertTable('manufacturers', manufacturer))
    .catch(err => {
        return db.modifyTable('manufacturers', manufacturers => {
          return manufacturers.get(manufacturer.publicKey).delete()
        })
          .then(() => { throw err })
      })
}

const update = (publicKey, changes) => {
  return db.validate(changes, UPDATE_SCHEMA)
    .then(() => db.updateTable('manufacturers', publicKey, changes))
    .then(results => {
      if (results.unchanged === 1) {
        return db.queryTable('manufacturers', manufacturers => manufacturers.get(publicKey), false)
      }

      const newManufacturer = results.changes[0].new_val

      return newManufacturer
    })
    .catch(err => { throw err })
}

module.exports = {
  query,
  insert,
  update
}