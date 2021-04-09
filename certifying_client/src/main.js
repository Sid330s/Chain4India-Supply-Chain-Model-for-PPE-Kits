
'use strict'

require('bootstrap')
require('../styles/main.scss')

const m = require('mithril')

const api = require('./services/api')
const transactions = require('./services/transactions')
const navigation = require('./components/navigation')

const AddAssetForm = require('./views/add_asset_form')
const AgentDetailPage = require('./views/agent_detail')
const AgentList = require('./views/list_agents')
const AssetList = require('./views/list_assets')
const AssetDetail = require('./views/asset_detail')
const Dashboard = require('./views/dashboard')
const LoginForm = require('./views/login_form')
const PropertyDetailPage = require('./views/property_detail')
const SignupForm = require('./views/signup_form')

/**
 * A basic layout component that adds the navbar to the view.
 */
const Layout = {
  view (vnode) {
    return [
      vnode.attrs.navbar,
      m('.content.container', vnode.children)
    ]
  }
}

const loggedInNav = () => {
  const links = [
    ['/assets', 'View Equipments'],
    ['/agents', 'View Participants']
  ]
  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.link('/profile', 'Profile'),
    navigation.button('/logout', 'Logout')
  ])
}

const loggedOutNav = () => {
  const links = [
    ['/assets', 'View Equipments'],
    ['/agents', 'View Participants']
  ]
  return m(navigation.Navbar, {}, [
    navigation.links(links),
    navigation.button('/login', 'Login/Signup')
  ])
}

/**
 * Returns a route resolver which handles authorization related business.
 */
const resolve = (view, restricted = false) => {
  const resolver = {}

  if (restricted) {
    resolver.onmatch = () => {
      if (api.getAuth()) return view
      m.route.set('/login')
    }
  }

  resolver.render = vnode => {
    if (api.getAuth()) {
      return m(Layout, { navbar: loggedInNav() }, m(view, vnode.attrs))
    }
    return m(Layout, { navbar: loggedOutNav() }, m(view, vnode.attrs))
  }

  return resolver
}

/**
 * Clears user info from memory/storage and redirects.
 */
const logout = () => {
  api.clearAuth()
  transactions.clearPrivateKey()
  m.route.set('/')
}

/**
 * Redirects to user's agent page if logged in.
 */
const profile = () => {
  const publicKey = api.getPublicKey()
  if (publicKey) m.route.set(`/agents/${publicKey}`)
  else m.route.set('/')
}

/**
 * Build and mount app/router
 */
document.addEventListener('DOMContentLoaded', () => {
  m.route(document.querySelector('#app'), '/', {
    '/': resolve(Dashboard),
    '/agents/:publicKey': resolve(AgentDetailPage),
    '/agents': resolve(AgentList),
    '/create': resolve(AddAssetForm, true),
    '/assets/:recordId': resolve(AssetDetail),
    '/assets': resolve(AssetList),
    '/login': resolve(LoginForm),
    '/logout': { onmatch: logout },
    '/profile': { onmatch: profile },
    '/assets/:recordId/:name': resolve(PropertyDetailPage),
    '/signup': resolve(SignupForm)
  })
})
