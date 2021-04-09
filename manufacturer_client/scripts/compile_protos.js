
'use strict'

const fs = require('fs')
const path = require('path')
const protobuf = require('protobufjs')
const jsonTarget = require('../node_modules/protobufjs/cli/targets/json')

let root = new protobuf.Root()

let files = fs
  .readdirSync(path.resolve(__dirname, '../../protos'))
  .map(f => path.resolve(__dirname, '../../protos', f))
  .filter(f => f.endsWith('.proto'))

try {
  root = root.loadSync(files)
} catch (e) {
  console.log('Unable to load protobuf files!')
  throw e
}

jsonTarget(root, {}, (err, output) => {
  if (err) {
    throw err
  }

  if (output !== '') {
    process.stdout.write(output, 'utf8')
  }
})
