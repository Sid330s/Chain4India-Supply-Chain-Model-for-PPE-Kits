
'use strict'

const m = require('mithril')
const _ = require('lodash')

const api = require('../services/api')
const transactions = require('../services/transactions')
const layout = require('../components/layout')
const forms = require('../components/forms')

const bullets = count => _.fill(Array(count), '•').join('')

const labeledField = (header, field) => {
  return m('.field-group.mt-5', header, field)
}

const fieldHeader = (label, ...additions) => {
  return m('.field-header', [
    m('span.h5.mr-3', label),
    additions
  ])
}

const staticField = (label, info) => labeledField(fieldHeader(label), info)

const toggledInfo = (isToggled, initialView, toggledView) => {
  return m('.field-info', isToggled ? toggledView : initialView)
}

const infoForm = (state, key, onSubmit, opts) => {
  return m('form.form-inline', {
    onsubmit: () => onSubmit().then(() => { state.toggled[key] = false })
  }, [
    m('input.form-control-sm.mr-1', _.assign({
      oninput: m.withAttr('value', value => { state.update[key] = value })
    }, opts)),
    m('button.btn.btn-secondary.btn-sm.mr-1', {
      onclick: () => { state.toggled[key] = false }
    }, 'Cancel'),
    m('button.btn.btn-primary.btn-sm.mr-1', { type: 'submit' }, 'Update')
  ])
}

const privateKeyField = state => {
  return labeledField(
    fieldHeader('Private Key',
      forms.clickIcon('eye', () => {
        if (state.toggled.privateKey) {
          state.toggled.privateKey = false
          return
        }
        return transactions.getPrivateKey()
          .then(privateKey => {
            state.toggled.privateKey = privateKey
            m.redraw()
          })
      }),
      forms.clickIcon('cloud-download', () => {
        return transactions.getPrivateKey()
          .then(privateKey => {
            forms.triggerDownload(`${state.agent.username}.priv`, privateKey)
          })
      })),
    toggledInfo(
      state.toggled.privateKey,
      bullets(64),
      state.toggled.privateKey))
}

const editIcon = (obj, key) => {
  return forms.clickIcon('pencil', () => { obj[key] = !obj[key] })
}

const editField = (state, label, key, route) => {
  const currentInfo = _.get(state, ['agent', key], 'OOPs')
  const onSubmit = () => {
    return api.patch(route, _.pick(state.update, key))
      .then(() => { state.agent[key] = state.update[key] })
  }

  return labeledField(
    fieldHeader(label, editIcon(state.toggled, key)),
    toggledInfo(
      state.toggled[key],
      currentInfo,
      infoForm(state, key, onSubmit, {placeholder: currentInfo})))
}

const passwordField = state => {
  const onSubmit = () => {
    return transactions.changePassword(state.update.password)
      .then(encryptedKey => {
        return api.patch('users', {
          encryptedKey,
          password: state.update.password
        })
      })
      .then(() => m.redraw())
  }

  return labeledField(
    fieldHeader('Password', editIcon(state.toggled, 'password')),
    toggledInfo(
      state.toggled.password,
      bullets(16),
      infoForm(state, 'password', onSubmit, { type: 'password' })))
}

/**
 * Displays information for a particular Agent.
 * The information can be edited if the user themself.
 */
const AgentDetailPage = {
  oninit (vnode) {
    vnode.state.toggled = {}
    vnode.state.update = {}
    api.get(`agents/${vnode.attrs.publicKey}`)
      .then(agent => { vnode.state.agent = agent })
  },

  view (vnode) {
    const publicKey = _.get(vnode.state, 'agent.publicKey', 'OOPs')
    const type = _.get(vnode.state, 'agent.type', 'OOPs')

    const profileContent = [
      layout.row(privateKeyField(vnode.state)),
      layout.row([
        editField(vnode.state, 'Username', 'username', 'users'),
        passwordField(vnode.state)
      ]),
      layout.row([
        editField(vnode.state, 'Email', 'email', 'users'),
        editField(vnode.state, 'Address', 'address', 'certifiers')
      ]),
      layout.row(editField(vnode.state, 'Pincode', 'pincode', 'certifiers'))
    ]

    return [
      layout.title(_.get(vnode.state, 'agent.name', '')),
      m('.container',
        layout.row(staticField('Public Key', publicKey)),
        layout.row(staticField('Type', type)),
        publicKey === api.getPublicKey() ? profileContent : null)
    ]
  }
}

module.exports = AgentDetailPage
