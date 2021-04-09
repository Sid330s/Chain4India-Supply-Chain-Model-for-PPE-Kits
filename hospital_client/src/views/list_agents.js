
'use strict'

const m = require('mithril')
const sortBy = require('lodash/sortBy')
const truncate = require('lodash/truncate')
const {Table, FilterGroup, PagingButtons} = require('../components/tables.js')
const api = require('../services/api')

const PAGE_SIZE = 50

const AgentList = {
  oninit (vnode) {
    vnode.state.agents = []
    vnode.state.filteredAgents = []
    vnode.state.currentPage = 0

    const refresh = () => {
      api.get('agents').then((agents) => {
        vnode.state.agents = sortBy(agents, 'name')
        vnode.state.filteredAgents = vnode.state.agents
      })
        .then(() => { vnode.state.refreshId = setTimeout(refresh, 2000) })
    }

    refresh()
  },

  onbeforeremove (vnode) {
    clearTimeout(vnode.state.refreshId)
  },

  view (vnode) {
    let publicKey = api.getPublicKey()
    return [
      m('.agent-list',
        m('.row.btn-row.mb-2', _controlButtons(vnode, publicKey)),
        m(Table, {
          headers: [
            'Name',
            'Key',
            'Owns',
            'Custodian',
            'Reports'
          ],
          rows: vnode.state.filteredAgents.slice(
              vnode.state.currentPage * PAGE_SIZE,
              (vnode.state.currentPage + 1) * PAGE_SIZE)
            .map((agent) => [
              m(`a[href=/agents/${agent.key}]`, { oncreate: m.route.link },
                truncate(agent.name, { length: 32 })),
              truncate(agent.key, { length: 32 }),
              agent.owns.length,
              agent.custodian.length,
              agent.reports.length
            ]),
          noRowsText: 'No agents found'
        })
     )
    ]
  }
}

const _controlButtons = (vnode, publicKey) => {
  if (publicKey) {
    let filterAgents = (f) => {
      vnode.state.filteredAgents = vnode.state.agents.filter(f)
    }

    return [
      m('.col-sm-8',
        m(FilterGroup, {
          ariaLabel: 'Filter Based on Ownership',
          filters: {
            'All': () => { vnode.state.filteredAgents = vnode.state.agents },
            'Owners': () => filterAgents(agent => agent.owns.length > 0),
            'Custodians': () => filterAgents(agent => agent.custodian.length > 0),
            'Reporters': () => filterAgents(agent => agent.reports.length > 0)
          },
          initialFilter: 'All'
        })),
      m('.col-sm-4', _pagingButtons(vnode))
    ]
  } else {
    return [
      m('.col-sm-4.ml-auto', _pagingButtons(vnode))
    ]
  }
}

const _pagingButtons = (vnode) =>
  m(PagingButtons, {
    setPage: (page) => { vnode.state.currentPage = page },
    currentPage: vnode.state.currentPage,
    maxPage: Math.floor(vnode.state.filteredAgents.length / PAGE_SIZE)
  })

module.exports = AgentList
