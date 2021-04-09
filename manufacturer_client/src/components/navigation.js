
'use strict'

const m = require('mithril')

/**
 * A simple navbar wrapper, which displays children in the responsive collapse.
 */
const Navbar = {
  view (vnode) {
    return m('nav.navbar.navbar-expand-sm.navbar-dark.bg-dark.mb-5', [
      m('a.navbar-brand[href="/"]', { oncreate: m.route.link }, 'Chain4India'),
      m('button.navbar-toggler', {
        type: 'button',
        'data-toggle': 'collapse',
        'data-target': '#navbar',
        'aria-controls': 'navbar',
        'aria-expanded': 'false',
        'aria-label': 'Toggle navigation'
      }, m('span.navbar-toggler-icon')),
      m('#navbar.collapse.navbar-collapse', vnode.children)
    ])
  }
}

/**
 * Creates a list of left-aligned navbar links from href/label tuples.
 */
const links = items => {
  return m('ul.navbar-nav.mr-auto', items.map(([href, label]) => {
    return m('li.nav-item', [
      m('a.nav-link', { href, oncreate: m.route.link }, label)
    ])
  }))
}

/**
 * Creates a single link for use in a navbar.
 */
const link = (href, label) => {
  return m('.navbar-nav', [
    m('a.nav-link', { href, oncreate: m.route.link }, label)
  ])
}

/**
 * Creates a navigation button styled for use in the navbar.
 */
const button = (href, label) => {
  return m('a.btn.btn-outline-primary.my-2.my-sm-0', {
    href,
    oncreate: m.route.link
  }, label)
}

module.exports = {
  Navbar,
  link,
  links,
  button
}
