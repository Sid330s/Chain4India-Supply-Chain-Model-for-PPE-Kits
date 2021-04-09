
'use strict'

const m = require('mithril')

const api = require('../services/api')
const transactions = require('../services/transactions')
const forms = require('../components/forms')

/**
 * The Form for authorizing an existing user.
 */
const LoginForm = {
  view (vnode) {
    const setter = forms.stateSetter(vnode.state)

    return m('.login-form', [
      m('form', {
        onsubmit: (e) => {
          e.preventDefault()
          const credentials = {
            username: vnode.state.username,
            password: api.hashPassword(vnode.state.password)
          }
          api.post('authorization', credentials)
            .then(res => {
              api.setAuth(res.authorization)
              transactions.setPrivateKey(vnode.state.password,
                                         res.encryptedKey)
              m.route.set('/')
            })
        }
      },
      m('legend', 'Login Agent'),
      forms.textInput(setter('username'), 'Username'),
      forms.passwordInput(setter('password'), 'Password'),
      m('.container.text-center',
        'Or you can ',
        m('a[href="/signup"]',
          { oncreate: m.route.link },
          'create a new Agent')),
      m('.form-group',
        m('.row.justify-content-end.align-items-end',
          m('col-2',
            m('button.btn.btn-primary',
              {'data-toggle': 'modal', 'data-target': '#modal'},
              'Login')))))
    ])
  }
}

module.exports = LoginForm
