
'use strict'

const _ = require('lodash')
const r = require('rethinkdb')
const db = require('./')

const addBlockState = (tableName, indexName, indexValue, doc, blockNum) => {
  return db.modifyTable(tableName, table => {
    return table
      .getAll(indexValue, { index: indexName })
      .filter({ endBlockNum: Number.MAX_SAFE_INTEGER })
      .coerceTo('array')
      .do(oldDocs => {
        return oldDocs
          .filter({ startBlockNum: blockNum })
          .coerceTo('array')
          .do(duplicates => {
            return r.branch(
              duplicates.count().gt(0),
              duplicates,

              table
                .getAll(indexValue, { index: indexName })
                .update({ endBlockNum: blockNum })
                .do(() => {
                  return table.insert(_.assign({}, doc, {
                    startBlockNum: blockNum,
                    endBlockNum: Number.MAX_SAFE_INTEGER
                  }))
                })
            )
          })
      })
  })
}

const addAgent = (agent, blockNum) => {
  return addBlockState('agents', 'publicKey', agent.publicKey,
                       agent, blockNum)
}

const addRecord = (record, blockNum) => {
  return addBlockState('records', 'recordId', record.recordId,
                       record, blockNum)
}

const addRecordType = (type, blockNum) => {
  return addBlockState('recordTypes', 'name', type.name,
                       type, blockNum)
}

const addProperty = (property, blockNum) => {
  return addBlockState('properties', 'attributes',
                       ['name', 'recordId'].map(k => property[k]),
                       property, blockNum)
}

const addPropertyPage = (page, blockNum) => {
  return addBlockState('propertyPages', 'attributes',
                       ['name', 'recordId', 'pageNum'].map(k => page[k]),
                       page, blockNum)
}

const addProposal = (proposal, blockNum) => {
  return addBlockState(
    'proposals', 'attributes',
    ['recordId', 'timestamp', 'receivingAgent', 'role'].map(k => proposal[k]),
    proposal, blockNum)
}

module.exports = {
  addAgent,
  addRecord,
  addRecordType,
  addProperty,
  addPropertyPage,
  addProposal
}
