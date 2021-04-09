
'use strict'

const r = require('rethinkdb')
const config = require('../system/config')

const HOST = config.DB_HOST
const PORT = config.DB_PORT
const NAME = config.DB_NAME

r.connect({host: HOST, port: PORT})
  .then(conn => {
    console.log(`Creating "${NAME}" database...`)
    r.dbList().contains(NAME).run(conn)
      .then(dbExists => {
        if (dbExists) throw new Error(`"${NAME}" already exists`)
        return r.dbCreate(NAME).run(conn)
      })
      .then(() => {
        console.log('Creating "users" table...')
        return r.db(NAME).tableCreate('users', {
          primaryKey: 'publicKey'
        }).run(conn)
      })
      .then(() => {
        console.log('Creating "manufacturers" table...')
        return r.db(NAME).tableCreate('manufacturers', {
          primaryKey: 'publicKey'
        }).run(conn)
      })
      .then(() => {
        console.log('Creating "certifiers" table...')
        return r.db(NAME).tableCreate('certifiers', {
          primaryKey: 'publicKey'
        }).run(conn)
      })
      .then(() => {
        console.log('Creating "usernames" table...')
        return r.db(NAME).tableCreate('usernames', {
          primaryKey: 'username'
        }).run(conn)
      })
      .then(() => {
        console.log('Creating "agents" table...')
        return r.db(NAME).tableCreate('agents').run(conn)
      })
      .then(() => {
        return r.db(NAME).table('agents').indexCreate('publicKey').run(conn)
      })
      .then(() => {
        console.log('Creating "records" table...')
        return r.db(NAME).tableCreate('records').run(conn)
      })
      .then(() => {
        r.db(NAME).table('records').indexCreate('recordId').run(conn)
      })
      .then(() => {
        console.log('Creating "recordTypes" table...')
        return r.db(NAME).tableCreate('recordTypes').run(conn)
      })
      .then(() => {
        return r.db(NAME).table('recordTypes').indexCreate('name').run(conn)
      })
      .then(() => {
        console.log('Creating "properties" table...')
        return r.db(NAME).tableCreate('properties').run(conn)
      })
      .then(() => {
        return r.db(NAME).table('properties').indexCreate('attributes', [
          r.row('name'),
          r.row('recordId')
        ]).run(conn)
      })
      .then(() => {
        console.log('Creating "propertyPages" table...')
        return r.db(NAME).tableCreate('propertyPages').run(conn)
      })
      .then(() => {
        return r.db(NAME).table('propertyPages').indexCreate('attributes', [
          r.row('name'),
          r.row('recordId'),
          r.row('pageNum')
        ]).run(conn)
      })
      .then(() => {
        console.log('Creating "proposals" table...')
        return r.db(NAME).tableCreate('proposals').run(conn)
      })
      .then(() => {
        return r.db(NAME).table('proposals').indexCreate('attributes', [
          r.row('recordId'),
          r.row('timestamp'),
          r.row('receivingAgent'),
          r.row('role')
        ]).run(conn)
      })
      .then(() => {
        console.log('Creating "blocks" table...')
        return r.db(NAME).tableCreate('blocks', {
          primaryKey: 'blockNum'
        }).run(conn)
      })
      .then(() => {
        console.log('Bootstrapping complete, closing connection.')
        return conn.close()
      })
      .catch(err => {
        console.log(`Unable to bootstrap "${NAME}" db: ${err.message}`)
        return conn.close()
      })
  })
  .catch(err => {
    console.log(`Unable to connect to db at ${HOST}:${PORT}}: ${err.message}`)
  })
