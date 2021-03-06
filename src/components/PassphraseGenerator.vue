<template>
  <div :class="className">
    <div class="text-xs-center">
      <h3 :class="`${className}__title`">{{ $t('login.create_address_label') }}</h3>
      <v-btn @click="generatePassphrase" :class="`${className}__button`" flat small>
        {{ $t('login.new_button') }}
      </v-btn>
    </div>

    <transition name="slide-fade">
      <div v-if="showPassphrase">
        <div
          v-html="$t('login.new_passphrase_label')"
          class="caption grey--text mt-2"
          ref="el"
        ></div>
        <v-textarea
          :value="passphrase"
          @click.prevent="selectText"
          type="text"
          multi-line
          readonly
          rows="2"
          class="pt-0"
          color="grey"
          no-resize
          ref="textarea"
        >
          <template slot="append">
            <div :class="`${className}__icons`">
              <icon
                @click="copyToClipboard"
                :width="24"
                :height="24"
                shape-rendering="crispEdges"
                :title="$t('login.copy_button_tooltip')"
              >
                <copy-icon/>
              </icon>
              <icon
                @click="saveFile"
                :width="24"
                :height="24"
                shape-rendering="auto"
                :title="$t('login.save_button_tooltip')"
              >
                <save-icon/>
              </icon>
              <icon
                @click="showQrcodeRendererDialog = true"
                :width="24"
                :height="24"
                shape-rendering="crispEdges"
                :title="$t('login.save_qr_code_tooltip')"
              >
                <qr-code-icon/>
              </icon>
            </div>
          </template>
        </v-textarea>
      </div>
    </transition>

    <QrcodeRendererDialog
      v-model="showQrcodeRendererDialog"
      :passphrase="passphrase"
    />
  </div>
</template>

<script>
import Mnemonic from 'bitcore-mnemonic'

import { copyToClipboard, downloadFile } from '@/lib/textHelpers'
import QrcodeRendererDialog from '@/components/QrcodeRendererDialog'
import Icon from '@/components/icons/BaseIcon'
import CopyIcon from '@/components/icons/common/Copy'
import SaveIcon from '@/components/icons/common/Save'
import QrCodeIcon from '@/components/icons/common/QrCode'

export default {
  computed: {
    className () {
      return 'passphrase-generator'
    }
  },
  data: () => ({
    passphrase: '',
    showPassphrase: false,
    showQrcodeRendererDialog: false
  }),
  methods: {
    copyToClipboard () {
      copyToClipboard(this.passphrase)

      this.$emit('copy')
    },
    saveFile () {
      var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      if (!iOS) {
        downloadFile(
          this.passphrase,
          'adm-' + btoa(new Date().getTime()).replace('==', '') + '.txt',
          'text/plain'
        )
      }

      this.$emit('save')
    },
    selectText () {
      this.$refs.textarea.$el
        .querySelector('textarea')
        .select()
    },
    generatePassphrase () {
      this.passphrase = new Mnemonic(Mnemonic.Words.ENGLISH).toString()

      this.showPassphrase = true
    }
  },
  components: {
    Icon,
    CopyIcon,
    SaveIcon,
    QrCodeIcon,
    QrcodeRendererDialog
  }
}
</script>

<style lang="stylus" scoped>
@import '~vuetify/src/stylus/settings/_variables.styl'

/**
 * 1. Blur icons when focus textarea.
 */
.passphrase-generator
  &__title
    font-size: 14px
    font-weight: 300
  &__button
    font-size: 16px
    font-weight: 500
    text-decoration: underline
    text-transform: unset
  &__icons
    > *:not(:first-child)
      margin-left: 8px
  .v-input--is-focused
    .v-icon
      opacity: 0.3 // [1]

/** Themes **/
.theme--light
  .passphrase-generator
    &__title, &__button
      color: $grey.darken-3
.theme--dark
  .passphrase-generator
    &__title, &__button
      color: $shades.white
</style>
