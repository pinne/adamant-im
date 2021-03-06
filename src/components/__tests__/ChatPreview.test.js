import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Vuetify from 'vuetify'

import formatters from '@/lib/formatters'
import mockupI18n from './__mocks__/plugins/i18n'
import ChatPreview from '@/components/ChatPreview'

// mocking `moment` to always be UTC for tests
jest.mock('moment', () => {
  const moment = require.requireActual('moment-timezone')
  moment.tz.setDefault('UTC')

  return moment
})

Vue.use(Vuetify)
Vue.use(VueI18n)
Vue.use(Vuex)

// set $formatAmount & $formatDate prototype methods
formatters(Vue)

/**
 * Fake vars for testing getters.
 */
let fake = createFakeVars()

function createFakeVars () {
  return {
    partnerId: 'U123456',
    partnerName: 'Rick',
    lastMessage: {
      id: 1,
      type: 'message',
      message: 'you are death if you touch me'
    },
    lastMessageText: 'you are death if you touch me',
    lastMessageTimestamp: 0, // 01.01.1970
    numOfNewMessages: 0
  }
}

/**
 * Mockup store helper
 */
function mockupStore () {
  const partners = {
    getters: {
      displayName: state => partnerId => fake.partnerName
    },
    namespaced: true
  }

  const chat = {
    getters: {
      numOfNewMessages: state => partnerId => fake.numOfNewMessages,
      lastMessage: state => partnerId => fake.lastMessage,
      lastMessageText: state => partnerId => fake.lastMessageText,
      lastMessageTimestamp: state => partnerId => fake.lastMessageTimestamp
    },
    namespaced: true
  }

  const language = {
    state: {
      currentLocale: 'en'
    },
    namespaced: true
  }

  const options = {
    state: {
      formatMessages: true
    },
    namespaced: true
  }

  const store = new Vuex.Store({
    modules: {
      partners,
      chat,
      language,
      options
    }
  })

  return {
    store,
    partners,
    chat,
    language,
    options
  }
}

describe('ChatPreview.vue', () => {
  let i18n = null
  let store = null
  let chat = null
  let partners = null
  let language = null
  let options = null

  beforeEach(() => {
    const vuex = mockupStore()
    store = vuex.store
    chat = vuex.chat
    partners = vuex.partners
    language = vuex.language
    options = vuex.options

    i18n = mockupI18n()
    fake = createFakeVars() // reset fake vars
  })

  it('renders the correct markup', () => {
    const wrapper = shallowMount(ChatPreview, {
      store,
      i18n,
      propsData: {
        partnerId: fake.partnerId
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it('check computed properties', () => {
    fake.partnerId = 'U654321'
    fake.partnerName = 'Morty'
    fake.lastMessageText = 'ok'
    fake.lastMessageTimestamp = 3600 // Sep 2, 21:00
    fake.numOfNewMessages = 1

    const wrapper = shallowMount(ChatPreview, {
      store,
      i18n,
      propsData: {
        partnerId: fake.partnerId
      }
    })

    expect(wrapper.vm.partnerName).toBe('Morty')
    expect(wrapper.vm.lastMessageText).toBe('ok')
    expect(wrapper.vm.lastMessageTimestamp).toBe(3600)
    expect(wrapper.vm.numOfNewMessages).toBe(1)
    expect(wrapper.vm.createdAt).toBe(3600)
  })
})
