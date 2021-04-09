
'use strict'

const r = require('rethinkdb')
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

module.exports = {
  connect,
  queryTable,
  modifyTable
}
