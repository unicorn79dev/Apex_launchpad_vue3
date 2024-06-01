<template>
  <div style="display: inline-block; position: relative;">
    <div class="d-flex align-center">
      <v-menu
        offset-y
        content-class="br-20"
        transition="fade-transition"
      >
        <!-- <template #activator="{ attrs, on }"> -->
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            small
            text
            rounded :color="color"
            class="pa-0 pl-1 pr-1"
          >
            {{ tokenAddressCondensed }}
            <v-icon x-small class="ml-2">mdi-content-copy</v-icon>
          </v-btn>
        </template>

        <v-list style="min-width: 200px;" class="background br-20 ma-0 pa-0">
          <v-list-item dense @click="copyTokenAddress">
            <v-list-item-title>
              Copy Address
            </v-list-item-title>
          </v-list-item>
          <v-list-item dense @click="copyTokenAddressLowercase">
            <v-list-item-title>
              Copy Address (in lowercase)
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-scroll-x-transition>
        <v-card v-if="textCopied" class="px-2 primary br-20" style="position: absolute; left: 0; top: 0px; z-index: 1;">
          <div class="white--text caption font-weight-bold">
            <v-icon small color="white">mdi-check-circle-outline</v-icon>
            Copied
          </div>
        </v-card>
      </v-scroll-x-transition>
      <div ref="copyContainer" class="t-small"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    address: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      textCopied: false,
    };
  },

  computed: {
    tokenAddressCondensed() {
      if (!this.address) {
        return '';
      }
      return this.address.slice(0, 6) + '...' + this.address.slice(-4);
    }
  },
  
  methods: {
    copyTokenAddress() {
      const container = this.$refs.copyContainer;
      this.$copyText(this.address, container).then(() => {
        this.textCopied = true;
        setTimeout(() => {
          this.textCopied = false;
        }, 1000);
      }, () => {
        alert('Cannot copy');
      });
    },
    copyTokenAddressLowercase() {
      const container = this.$refs.copyContainer;
      this.$copyText(this.address.toLowerCase(), container).then(() => {
        this.textCopied = true;
        setTimeout(() => {
          this.textCopied = false;
        }, 1000);
      }, () => {
        alert('Cannot copy');
      });
    },
  }
};
</script>

<style scoped>
/* Scoped styles */
.deadlink {
  text-decoration: none;
  color: unset !important;
}
</style>
