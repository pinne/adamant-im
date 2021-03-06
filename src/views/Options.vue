<template>
  <div class="options-page">
    <app-toolbar-centered
      app
      :title="$t('options.page_title')"
      :show-back="true"
      flat
    />

    <v-container fluid>
      <v-layout row wrap justify-center>

        <container>

          <!-- General -->
          <h3 class="title mt-3 mb-3">{{ $t('options.general_title') }}</h3>
          <v-layout row wrap align-center>
            <v-flex xs6>
              <v-subheader class="subheading font-weight-regular pa-0">{{ $t('options.language_label') }}</v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-right">
              <language-switcher
                append-icon="mdi-chevron-down"
              />
            </v-flex>
            <v-flex xs12 class="mt-2">
              <v-checkbox
                :label="$t('options.dark_theme')"
                color="grey darken-1"
                v-model="darkTheme"
              />
            </v-flex>
          </v-layout>

          <!-- Security -->
          <h3 class="title mt-4 mb-4">{{ $t('options.security_title') }}</h3>
          <v-layout row wrap align-center>
            <v-flex xs12>
              <v-checkbox
                :label="$t('options.exit_on_close')"
                :title="$t('options.exit_on_close_tooltip')"
                color="grey darken-1"
                :input-value="logoutOnTabClose"
                @click="onCheckLogoutOnTabClose"
                readonly
              />

              <password-set-dialog v-model="passwordDialog" @password="onSetPassword" />
            </v-flex>
          </v-layout>

          <!-- Chats -->
          <h3 class="title mt-4 mb-4">{{ $t('options.chats_title') }}</h3>
          <v-layout row wrap align-center>
            <v-flex xs12>
              <v-checkbox
                :label="$t('options.send_on_enter')"
                :title="$t('options.send_on_enter_tooltip')"
                color="grey darken-1"
                v-model="sendMessageOnEnter"
              />
              <v-checkbox
                :label="$t('options.format_messages')"
                :title="$t('options.format_messages_tooltip')"
                color="grey darken-1"
                v-model="formatMessages"
              />
            </v-flex>
          </v-layout>

          <!-- Notifications -->
          <h3 class="title mt-4 mb-4">{{ $t('options.notification_title') }}</h3>
          <v-layout row wrap align-center>
            <v-flex xs12>
              <v-checkbox
                :label="$t('options.enable_sound')"
                :title="$t('options.enable_sound_tooltip')"
                color="grey darken-1"
                v-model="allowSoundNotifications"
              />
            </v-flex>
            <v-flex xs12>
              <v-checkbox
                :label="$t('options.enable_bar')"
                :title="$t('options.enable_bar_tooltip')"
                color="grey darken-1"
                v-model="allowTabNotifications"
              />
            </v-flex>
            <v-flex xs12>
              <v-checkbox
                :label="$t('options.enable_push')"
                :title="$t('options.enable_push_tooltip')"
                color="grey darken-1"
                v-model="allowPushNotifications"
              />
            </v-flex>
          </v-layout>

          <!-- Delegates -->
          <h3 class="title mt-4 mb-4">{{ $t('options.other') }}</h3>
          <v-layout row wrap align-center>
           <v-flex xs12>
             <v-btn flat @click="$router.push('/options/nodes')">{{ $t('options.nodes_list') }}</v-btn>

             <v-btn flat class="text-xs-left" @click="$router.push('/votes')">
               {{ $t('options.vote_for_delegates_button') }}
             </v-btn>

             <div class="text-xs-right">{{ $t('options.version') }} {{ this.$root.$options.version }}</div>
           </v-flex>
          </v-layout>

        </container>

      </v-layout>
    </v-container>
  </div>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher'
import AppToolbarCentered from '@/components/AppToolbarCentered'
import PasswordSetDialog from '@/components/PasswordSetDialog'
import { clearDb, db as isIDBSupported } from '@/lib/idb'

export default {
  computed: {
    logoutOnTabClose () {
      return this.$store.state.options.logoutOnTabClose
    },
    sendMessageOnEnter: {
      get () {
        return this.$store.state.options.sendMessageOnEnter
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'sendMessageOnEnter',
          value
        })
      }
    },
    formatMessages: {
      get () {
        return this.$store.state.options.formatMessages
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'formatMessages',
          value
        })
      }
    },
    allowSoundNotifications: {
      get () {
        return this.$store.state.options.allowSoundNotifications
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'allowSoundNotifications',
          value
        })
      }
    },
    allowTabNotifications: {
      get () {
        return this.$store.state.options.allowTabNotifications
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'allowTabNotifications',
          value
        })
      }
    },
    allowPushNotifications: {
      get () {
        return this.$store.state.options.allowPushNotifications
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'allowPushNotifications',
          value
        })
      }
    },
    darkTheme: {
      get () {
        return this.$store.state.options.darkTheme
      },
      set (value) {
        this.$store.commit('options/updateOption', {
          key: 'darkTheme',
          value
        })
      }
    }
  },
  data: () => ({
    passwordDialog: false
  }),
  methods: {
    onSetPassword (password) {
      this.$store.commit('options/updateOption', {
        key: 'logoutOnTabClose',
        value: false
      })
    },
    onCheckLogoutOnTabClose () {
      if (this.logoutOnTabClose) {
        isIDBSupported
          .then(() => {
            this.passwordDialog = true
          })
          .catch(() => {
            this.$store.dispatch('snackbar/show', {
              message: this.$t('options.idb_not_supported'),
              timeout: 5000
            })
          })
      } else {
        clearDb().then(() => {
          this.$store.commit('options/updateOption', {
            key: 'logoutOnTabClose',
            value: true
          })

          this.$store.commit('resetPassword')
        })
      }
    }
  },
  components: {
    LanguageSwitcher,
    AppToolbarCentered,
    PasswordSetDialog
  }
}
</script>
