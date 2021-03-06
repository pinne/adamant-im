<template>
  <div>
    <app-toolbar-centered
      app
      :title="$t('votes.page_title')"
      flat
    />

    <v-container fluid class="px-0">
      <v-layout row wrap justify-center>

        <container>

          <v-card>
            <v-card-title>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                :label="$t('votes.search')"
                single-line
                hide-details
              />
            </v-card-title>

            <v-data-table
              :headers="headers"
              :pagination.sync="pagination"
              :items="delegates"
              :rows-per-page-text="$t('rows_per_page')"
              :search="search"
              hide-actions
              item-key="username"
              class="elevation-1"
            >
              <div slot="no-data" class="text-xs-center">
                <div v-if="waitingForConfirmation">
                  <v-progress-circular
                    indeterminate
                    color="grey darken-1"
                    size="24"
                    class="mr-3"
                  />
                  <span>{{ $t('votes.waiting_confirmations') }}</span>
                </div>
                <div v-else>
                  {{ $t('votes.no_data_available') }}
                </div>
              </div>

              <template slot="headerCell" slot-scope="props">
                <span slot="activator">
                  {{ $t(props.header.text) }}
                </span>
              </template>

              <template slot="items" slot-scope="props">
                <td @click="toggleDetails(props.item, props)" style="cursor:pointer">{{ props.item.username }}</td>
                <td>{{ props.item.rank }}</td>
                <td>
                  <v-icon v-if="props.item._voted" @click="downVote(props.item.address)">mdi-thumb-up</v-icon>
                  <v-icon v-else @click="upVote(props.item.address)">mdi-thumb-up-outline</v-icon>
                </td>
              </template>

              <template slot="expand" slot-scope="props">
                <v-card flat>

                  <v-list>
                    <v-list-tile>
                      <v-list-tile-content>
                        <v-list-tile-title>
                          <a :href="'https://explorer.adamant.im/delegate/' + props.item.address" target="_blank">
                            {{ props.item.address }}
                          </a>
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile
                      v-for="(item, i) in delegateDetails"
                      :key="i"
                    >
                      <v-list-tile-content>
                        <v-list-tile-title>
                          {{ item.title }}
                        </v-list-tile-title>
                      </v-list-tile-content>
                      <v-list-tile-content>
                        <v-list-tile-title class="text-xs-right">
                          {{ item.format ? item.format(item.value.call(props.item)) : item.value.call(props.item) }}
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>

                </v-card>
              </template>

              <v-alert slot="no-results" :value="true" color="grey darken-1" icon="mdi-alert">
                Your search for "{{ search }}" found no results.
              </v-alert>

              <template slot="footer">
                <td :colspan="headers.length" class="pa-0">

                  <v-layout row wrap align-center justify-space-between>
                    <v-btn dark @click="showConfirmationDialog">
                      {{ $t('votes.vote_button_text') }}
                    </v-btn>
                    <pagination v-model="pagination.page" :pages="pages"></pagination>
                  </v-layout>

                </td>
              </template>
            </v-data-table>
          </v-card>

        </container>

      </v-layout>
    </v-container>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <v-card>
        <v-card-title>
          <div>
            <h3 class="headline mb-0">{{ $t('votes.summary_title') }}</h3>
            <div>
              {{ $t('votes.upvotes') }}: <strong>{{ numOfUpvotes }}</strong>,&nbsp;
              {{ $t('votes.downvotes') }}: <strong>{{ numOfDownvotes }}</strong>,&nbsp;
              {{ $t('votes.total_new_votes') }}: <strong>{{ numOfUpvotes + numOfDownvotes }} / {{ voteRequestLimit }}</strong>,&nbsp;
              {{ $t('votes.total_votes') }}: <strong>{{ totalVotes }} / {{ delegates.length }}</strong>
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            flat="flat"
            @click="dialog = false"
          >
            {{ $t('transfer.confirm_cancel') }}
          </v-btn>

          <v-btn
            flat="flat"
            @click="sendVotes"
          >
            {{ $t('transfer.confirm_approve') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AppToolbarCentered from '@/components/AppToolbarCentered'
import Pagination from '@/components/Pagination'
import currencyFilter from '@/filters/currency'

export default {
  mounted () {
    this.$store.dispatch('delegates/getDelegates', {
      address: this.$store.state.address
    })
  },
  computed: {
    delegates () {
      const delegates = this.$store.state.delegates.delegates || {}

      return Object.values(delegates)
    },
    numOfUpvotes () {
      return this.delegates
        .filter(delegate => delegate.upvoted && !delegate.voted)
        .length
    },
    numOfDownvotes () {
      return this.delegates
        .filter(delegate => delegate.downvoted && delegate.voted)
        .length
    },
    totalVotes () {
      return this.delegates.filter(delegate => delegate._voted).length
    },
    delegateDetails () {
      return [
        {
          title: this.$t('votes.delegate_uptime'),
          value () {
            return this.productivity
          },
          format: value => `${value}%`
        },
        {
          title: this.$t('votes.delegate_approval'),
          value () {
            return this.approval
          },
          format: value => `${value}%`
        },
        {
          title: this.$t('votes.delegate_forging_time'),
          value () {
            return this.forgingTime
          },
          format: value => this.formatForgingTime(value)
        },
        {
          title: this.$t('votes.delegate_forged'),
          value () {
            return this.forged
          },
          format: value => currencyFilter(value)
        },
        {
          title: this.$t('votes.delegate_link'),
          value () {
            return this.link
          }
        },
        {
          title: this.$t('votes.delegate_description'),
          value () {
            return this.description
          }
        }
      ]
    },
    pages () {
      if (this.delegates.length <= 0) {
        return 0
      }

      return Math.ceil(this.delegates.length / this.pagination.rowsPerPage)
    }
  },
  data: () => ({
    voteRequestLimit: 30,
    search: '',
    headers: [
      { text: 'votes.table_head_name', value: 'username' },
      { text: 'votes.table_head_rank', value: 'rank' },
      { text: 'votes.table_head_vote', value: '_voted' }
    ],
    pagination: {
      rowsPerPage: 10,
      sortBy: '',
      descending: true,
      page: 1
    },
    waitingForConfirmation: false,
    dialog: false
  }),
  methods: {
    upVote (id) {
      this.$store.commit('delegates/upVote', id)
    },
    downVote (id) {
      this.$store.commit('delegates/downVote', id)
    },
    sendVotes () {
      if (!this.validateVotes()) {
        return
      }

      const upVotes = this.delegates
        .filter(delegate => delegate.upvoted && !delegate.voted)
        .map(delegate => `+${delegate.publicKey}`)
      const downVotes = this.delegates
        .filter(delegate => delegate.downvoted && delegate.voted)
        .map(delegate => `-${delegate.publicKey}`)
      const allVotes = [...upVotes, ...downVotes]

      if (allVotes.length <= 0) {
        this.$store.dispatch('snackbar/show', {
          message: this.$t('votes.select_delegates')
        })

        return
      }

      this.waitingForConfirmation = true
      this.dialog = false

      this.$store.dispatch('delegates/voteForDelegates', {
        votes: [...upVotes, ...downVotes],
        address: this.$store.state.address
      })

      this.$store.dispatch('snackbar/show', {
        message: this.$t('votes.sent')
      })
    },
    validateVotes () {
      if (this.upvotedCount + this.downvotedCount > this.voteRequestLimit) {
        this.$store.dispatch('snackbar/show', {
          message: this.$t('votes.vote_request_limit', { limit: this.voteRequestLimit })
        })

        return false
      }

      if (this.$store.state.balance < 50) {
        this.$store.dispatch('snackbar/show', {
          message: this.$t('votes.no_money')
        })

        return false
      }

      return true
    },
    toggleDetails (delegate, props) {
      props.expanded = !props.expanded

      if (!props.expaned) {
        this.$store.dispatch('delegates/getForgedByAccount', delegate)
        this.$store.dispatch('delegates/getForgingTimeForDelegate', delegate)
      }
    },
    formatForgingTime (seconds) {
      if (!seconds) {
        return '...'
      }
      if (seconds === 0) {
        return this.$t('votes.now')
      }
      const minutes = Math.floor(seconds / 60)
      seconds = seconds - (minutes * 60)
      if (minutes && seconds) {
        return `${minutes} ${this.$t('votes.min')} ${seconds} ${this.$t('votes.sec')}`
      } else if (minutes) {
        return `${minutes} ${this.$t('votes.min')}`
      } else {
        return `${seconds} ${this.$t('votes.sec')}`
      }
    },
    showConfirmationDialog () {
      this.dialog = true
    }
  },
  components: {
    AppToolbarCentered,
    Pagination
  }
}
</script>

<style lang="stylus" scoped>
  @import '~vuetify/src/stylus/settings/_colors.styl'

  .theme--light
    .vote-card
      background-color: $grey.lighten-2
</style>
