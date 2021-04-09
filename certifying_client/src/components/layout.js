
'use strict'

const m = require('mithril')
const _ = require('lodash')
const octicons = require('octicons')

/**
 * Returns a header styled to be a page title
 */
const title = title => m('h3.text-center.mb-3', title)

/**
 * Returns a row of any number of columns, suitable for placing in a container
 */
const row = columns => {
  if (!_.isArray(columns)) columns = [columns]
  return m('.row', columns.map(col => m('.col-md', col)))
}

/**
 * Returns a mithriled icon from Github's octicon set
 */
const icon = name => m.trust(octicons[name].toSVG())

module.exports = {
  title,
  row,
  icon
}
