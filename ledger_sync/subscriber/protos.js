
'use strict'

const path = require('path')
const _ = require('lodash')
const protobuf = require('protobufjs')

const protos = {}

const loadProtos = (filename, protoNames) => {
  const protoPath = path.resolve(__dirname, '../../protos', filename)
  return protobuf.load(protoPath)
    .then(root => {
      protoNames.forEach(name => {
        protos[name] = root.lookupType(name)
      })
    })
}

const compile = () => {
  return Promise.all([
    loadProtos('agent.proto', [
      'Agent',
      'AgentContainer'
    ]),
    loadProtos('property.proto', [
      'Property',
      'PropertyContainer',
      'PropertyPage',
      'PropertyPageContainer',
      'PropertySchema',
      'PropertyValue',
      'Location'
    ]),
    loadProtos('proposal.proto', [
      'Proposal',
      'ProposalContainer'
    ]),
    loadProtos('record.proto', [
      'Record',
      'RecordContainer',
      'RecordType',
      'RecordTypeContainer'
    ]),
    loadProtos('payload.proto', [
      'SCPayload',
      'CreateAgentAction',
      'FinalizeRecordAction',
      'CreateRecordAction',
      'CreateRecordTypeAction',
      'UpdatePropertiesAction',
      'CreateProposalAction',
      'AnswerProposalAction',
      'RevokeReporterAction'
    ])
  ])
}

module.exports = _.assign(protos, { compile })
