
'use strict'

const secp256k1 = require('sawtooth-sdk/signing/secp256k1')
const {
  Batch,
  BatchHeader,
  TransactionHeader,
  TransactionList
} = require('sawtooth-sdk/protobuf')
const { BadRequest } = require('../api/errors')
const config = require('../system/config')

const PRIVATE_KEY = config.PRIVATE_KEY

const context = new secp256k1.Secp256k1Context()
const privateKey = secp256k1.Secp256k1PrivateKey.fromHex(PRIVATE_KEY)
const publicKeyHex = context.getPublicKey(privateKey).asHex()
console.log(`Batch signer initialized with public key: ${publicKeyHex}`)

const validateTxns = txns => {
  const headers = txns.map(txn => TransactionHeader.decode(txn.header))

  headers.forEach(header => {
    if (header.batcherPublicKey !== publicKeyHex) {
      throw new BadRequest(
        `Transactions must use batcherPublicKey: ${publicKeyHex}`)
    }
  })
}

const batchTxns = txns => {
  const header = BatchHeader.encode({
    signerPublicKey: publicKeyHex,
    transactionIds: txns.map(txn => txn.headerSignature)
  }).finish()

  return Batch.create({
    header,
    headerSignature: context.sign(header, privateKey),
    transactions: txns
  })
}

const batch = txnList => {
  const txns = TransactionList.decode(txnList).transactions
  validateTxns(txns)
  return batchTxns(txns)
}

const getPublicKey = () => publicKeyHex

module.exports = {
  batch,
  getPublicKey
}
