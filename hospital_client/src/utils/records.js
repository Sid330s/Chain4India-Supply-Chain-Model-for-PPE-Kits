
'use strict'

const _getProp = (record, propName) => {
  return record.properties.find((prop) => prop.name === propName)
}

const getPropertyValue = (record, propName, defaultValue = null) => {
  let prop = _getProp(record, propName)
  if (prop && prop.value) {
    return prop.value
  } else {
    return defaultValue
  }
}

const isReporter = (record, propName, publicKey) => {
  let prop = _getProp(record, propName)
  if (prop) {
    return prop.reporters.indexOf(publicKey) > -1
  } else {
    return false
  }
}

const _getPropTimeByComparison = (compare) => (record) => {
  if (!record.updates.properties) {
    return null
  }

  return Object.values(record.updates.properties)
      .reduce((acc, updates) => acc.concat(updates), [])
      .reduce((selected, update) =>
              compare(selected.timestamp, update.timestamp) ? update : selected)
      .timestamp
}

const getLatestPropertyUpdateTime =
  _getPropTimeByComparison((selected, timestamp) => selected < timestamp)

const getOldestPropertyUpdateTime =
  _getPropTimeByComparison((selected, timestamp) => selected > timestamp)

const countPropertyUpdates = (record) => {
  if (!record.updates.properties) {
    return 0
  }

  return Object.values(record.updates.properties).reduce(
    (sum, updates) => sum + updates.length, 0)
}

module.exports = {
  getPropertyValue,
  isReporter,
  getLatestPropertyUpdateTime,
  getOldestPropertyUpdateTime,
  countPropertyUpdates
}
