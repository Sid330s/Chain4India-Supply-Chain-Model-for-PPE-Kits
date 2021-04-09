
'use strict'

const _ = require('lodash')
const db = require('../db/records')

const FILTER_KEYS = ['recordId', 'recordType']

const fetchProperty = ({recordId, propertyName}) => {
  return db.fetchProperty(recordId, propertyName)
}

const fetchRecord = ({recordId, authedKey}) => {
  return db.fetchRecord(recordId, authedKey)
}

const listRecords = params => {
  return db.listRecords(params.authedKey, _.pick(params, FILTER_KEYS))
}

module.exports = {
  fetchProperty,
  fetchRecord,
  listRecords
}
