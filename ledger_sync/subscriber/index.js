
'use strict'

const _ = require('lodash')
const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')

const deltas = require('./deltas')
const config = require('../system/config')

const PREFIX = '3400de'
const NULL_BLOCK_ID = '0000000000000000'
const VALIDATOR_URL = config.VALIDATOR_URL
const stream = new Stream(VALIDATOR_URL)

const getBlock = events => {
  const block = _.chain(events)
    .find(e => e.eventType === 'sawtooth/block-commit')
    .get('attributes')
    .map(a => [a.key, a.value])
    .fromPairs()
    .value()

  return {
    blockNum: parseInt(block.block_num),
    blockId: block.block_id,
    stateRootHash: block.state_root_hash
  }
}

const getChanges = events => {
  const event = events.find(e => e.eventType === 'sawtooth/state-delta')
  if (!event) return []

  const changeList = StateChangeList.decode(event.data)
  return changeList.stateChanges
    .filter(change => change.address.slice(0, 6) === PREFIX)
}

const handleEvent = msg => {
  if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
    const events = EventList.decode(msg.content).events
    deltas.handle(getBlock(events), getChanges(events))
  } else {
    console.warn('Received message of unknown type:', msg.messageType)
  }
}

const subscribe = () => {
  const blockSub = EventSubscription.create({
    eventType: 'sawtooth/block-commit'
  })
  const deltaSub = EventSubscription.create({
    eventType: 'sawtooth/state-delta',
    filters: [EventFilter.create({
      key: 'address',
      matchString: `^${PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    })]
  })

  return stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    ClientEventsSubscribeRequest.encode({
      lastKnownBlockIds: [NULL_BLOCK_ID],
      subscriptions: [blockSub, deltaSub]
    }).finish()
  )
    .then(response => ClientEventsSubscribeResponse.decode(response))
    .then(decoded => {
      const status = _.findKey(ClientEventsSubscribeResponse.Status,
                               val => val === decoded.status)
      if (status !== 'OK') {
        throw new Error(`Validator responded with status "${status}"`)
      }
    })
}

const start = () => {
  return new Promise(resolve => {
    stream.connect(() => {
      stream.onReceive(handleEvent)
      subscribe().then(resolve)
    })
  })
}

module.exports = {
  start
}
