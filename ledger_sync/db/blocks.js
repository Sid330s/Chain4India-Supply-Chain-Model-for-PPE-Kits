
'use strict'

const r = require('rethinkdb')
const db = require('./')

const stateTables = [
  'agents',
  'records',
  'recordTypes',
  'properties',
  'propertyPages',
  'proposals'
]

const getForkedDocRemover = blockNum => tableName => {
  return db.modifyTable(tableName, table => {
    return table
      .filter(r.row('startBlockNum').ge(blockNum))
      .delete()
      .do(() => table.filter(doc => doc('endBlockNum').ge(blockNum)))
      .update({endBlockNum: Number.MAX_SAFE_INTEGER})
  })
}

const resolveFork = block => {
  const defork = getForkedDocRemover(block.blockNum)
  return db.modifyTable('blocks', blocks => {
    return blocks
      .filter(r.row('blockNum').ge(block.blockNum))
      .delete()
      .do(() => blocks.insert(block))
  })
    .then(() => Promise.all(stateTables.map(tableName => defork(tableName))))
    .then(() => block)
}

const insert = block => {
  return db.modifyTable('blocks', blocks => {
    return blocks
      .get(block.blockNum)
      .do(foundBlock => {
        return r.branch(foundBlock, foundBlock, blocks.insert(block))
      })
  })
    .then(result => {
      if (!result.blockId || result.blockId === block.blockId) {
        return block
      }
      return resolveFork(block)
    })
}

module.exports = {
  insert
}
