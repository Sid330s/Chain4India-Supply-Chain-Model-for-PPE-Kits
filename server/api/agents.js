
'use strict'

const _ = require('lodash')
const db = require('../db/agents')

const FILTER_KEYS = ['name', 'publicKey', 'type']

const list = params => db.list(_.pick(params, FILTER_KEYS))

const fetch = ({ publicKey, authedKey }) => db.fetch(publicKey, publicKey === authedKey)

module.exports = {
  list,
  fetch
}
