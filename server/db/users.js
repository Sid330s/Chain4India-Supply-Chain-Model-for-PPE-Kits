
'use strict'

const _ = require('lodash')
const db = require('./')

const USER_SCHEMA = {
  username: String,
  password: String,
  email: /.+@.+\..+/,
  publicKey: String,
  '?encryptedKey': String,
  '*': null
}

const UPDATE_SCHEMA = _.mapKeys(USER_SCHEMA, (_, key) => {
  if (key === '*' || key[0] === '?') return key
  return '?' + key
})

const query = query => db.queryTable('users', query)

const insert = user => {
  return db.validate(user, USER_SCHEMA)
    .then(() => db.insertTable('users', user))
    .then(results => {
      return db.insertTable('usernames', {username: user.username})
        .then(() => results)
        .catch(err => {
          return db.modifyTable('users', users => {
            return users.get(user.publicKey).delete()
          })
            .then(() => { throw err })
        })
    })
}

const update = (publicKey, changes) => {
  return db.validate(changes, UPDATE_SCHEMA)
    .then(() => db.updateTable('users', publicKey, changes))
    .then(results => {
      if (results.unchanged === 1) {
        return db.queryTable('users', users => users.get(publicKey), false)
      }

      const oldUser = results.changes[0].old_val
      const newUser = results.changes[0].new_val

      if (!changes.username) return newUser

      return db.modifyTable('usernames', usernames => {
        return usernames.get(oldUser.username).delete().do(() => {
          return usernames.insert({username: changes.username})
        })
      })
        .then(() => newUser)
        .catch(err => {
          return db.updateTable('users', publicKey, oldUser)
            .then(() => { throw err })
        })
    })
}

module.exports = {
  query,
  insert,
  update
}
