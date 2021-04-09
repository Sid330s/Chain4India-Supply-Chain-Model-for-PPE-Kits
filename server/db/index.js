
'use strict'

const r = require('rethinkdb')
const _ = require('lodash')
const jsSchema = require('js-schema')
const config = require('../system/config')

const HOST = config.DB_HOST
const PORT = config.DB_PORT
const NAME = config.DB_NAME
const RETRY_WAIT = config.RETRY_WAIT
const AWAIT_TABLE = 'blocks'

let connection = null

const awaitDatabase = () => {
  return r.tableList().run(connection)
    .then(tableNames => {
      if (!tableNames.includes(AWAIT_TABLE)) {
        throw new Error()
      }
    })
    .catch(() => {
      console.warn('Database not initialized:', NAME)
      console.warn(`Retrying database in ${RETRY_WAIT / 1000} seconds...`)
      return new Promise(resolve => setTimeout(resolve, RETRY_WAIT))
        .then(awaitDatabase)
    })
}

const connect = () => {
  return r.connect({host: HOST, port: PORT, db: NAME})
    .then(conn => {
      connection = conn
      return awaitDatabase()
    })
}

const runQuery = query => {
  return query
    .run(connection)
    .catch(err => {
      console.error(err.message)
      throw new Error(err.message)
    })
}

const queryWithCurrentBlock = query => {
  return runQuery(
    r.table('blocks')
      .orderBy(r.desc('blockNum'))
      .nth(0)('blockNum')
      .do(query)
  )
}

const queryTable = (table, query, removeCursor = true) => {
  return query(r.table(table))
    .run(connection)
    .then(cursor => removeCursor ? cursor.toArray() : cursor)
    .catch(err => {
      console.error(`Unable to query "${table}" table!`)
      console.error(err.message)
      throw new Error(err.message)
    })
}

const modifyTable = (table, query) => {
  return queryTable(table, query, false)
    .then(results => {
      if (!results) {
        throw new Error(`Unknown error while attempting to modify "${table}"`)
      }
      if (results.errors > 0) {
        throw new Error(results.first_error)
      }
      return results
    })
}

const insertTable = (table, doc) => {
  return modifyTable(table, t => t.insert(doc))
    .then(results => {
      if (results.inserted === 0) {
        throw new Error(`Unknown Error: Unable to insert to ${table}`)
      }
      return results
    })
}

const updateTable = (table, primary, changes) => {
  return modifyTable(table, t => {
    return t.get(primary).update(changes, {returnChanges: true})
  })
    .then(results => {
      if (results.replaced === 0 && results.unchanged === 0) {
        throw new Error(`Unknown Error: Unable to update ${primary}`)
      }
      return results
    })
}

const validate = (input, schema) => {
  return Promise.resolve()
    .then(() => {
      const validator = jsSchema(schema)
      if (validator(input)) return input

      const errors = validator.errors(input)
      if (!errors) throw new Error('Invalid Input: one or more keys forbidden')

      const [ key, message ] = _.entries(errors)[0]
      throw new Error(`Invalid Input: "${key}" - ${message}`)
    })
}

module.exports = {
  connect,
  runQuery,
  queryWithCurrentBlock,
  queryTable,
  modifyTable,
  insertTable,
  updateTable,
  validate
}
