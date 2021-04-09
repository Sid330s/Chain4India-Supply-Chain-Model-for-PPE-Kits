
'use strict'

const m = require('mithril')
const _ = require('lodash')

const forms = require('../components/forms')
const api = require('../services/api')
const transactions = require('../services/transactions')
const payloads = require('../services/payloads')

const passwordCard = state => {
  const setter = forms.stateSetter(state)
  const validator = forms.validator(
    () => state.password === state.confirm,
    'Passwords do not match',
    'confirm'
  )
  const passwordField = (id, placeholder) => {
    return forms.field(
      _.flow(setter(id), validator),
      {
        id,
        placeholder,
        type: 'password',
        class: 'border-warning'
      }
    )
  }

  return forms.group('Password', [
    m('.card.text-center.border-warning',
      m('.card-header.text-white.bg-warning', m('em', m('strong', 'WARNING!'))),
      m('.card-body.text-warning.bg-light',
        m('p.card-text',
          'This password will be used as a secret key to encrypt important ',
          'account information. Although it can be changed later, ',
          m('em',
            'if lost or forgotten it will be ',
            m('strong', 'impossible'),
            ' to recover your account.')),
        m('p.card-text', 'Keep it secure.'),
        passwordField('password', 'Enter password...'),
        passwordField('confirm', 'Confirm password...')))
  ])
}

const userSubmitter = state => e => {
  e.preventDefault()

  state.type = "Manufacturer"

  const keys = transactions.makePrivateKey(state.password)
  const user = _.assign(keys, _.pick(state, 'username', 'email', 'pincode', 'gst_no', 'contact_no'))
  user.password = api.hashPassword(state.password)
  const agent = payloads.createAgent(_.pick(state, 'name', 'type'))

  transactions.submit(agent, true)
    .then(() => api.post('manufacturers', user))
    .then(res => api.setAuth(res.authorization))
    .then(() => m.route.set('/'))
}

/**
 * The Form for authorizing an existing user.
 */
const SignupForm = {
  view (vnode) {
    const setter = forms.stateSetter(vnode.state)

    return m('.signup-form', [
      m('form', { onsubmit: userSubmitter(vnode.state) },
      m('legend', 'Create Manufacturer'),
      forms.textInput(setter('name'), 'Name'),
      forms.emailInput(setter('email'), 'Email'),
      forms.textInput(setter('username'), 'Username'),
      forms.numberInput(setter('pincode'), "Pincode"),
      forms.numberInput(setter('gst_no'), "GST No."),
      forms.numberInput(setter('contact_no'), "Contact No."),
      passwordCard(vnode.state),
      m('.container.text-center',
        'Or you can ',
        m('a[href="/login"]',
          { oncreate: m.route.link },
          'login an existing Agent')),
      m('.form-group',
        m('.row.justify-content-end.align-items-end',
          m('col-2',
            m('button.btn.btn-primary',
              'Create Agent')))))
    ])
  }
}

module.exports = SignupForm
