<template>
  <div v-if="amountRemaining !== '0' && !epochHasPassed" class="border-b">
    <div :class="['d-flex py-2 px-2 c-list align-center']" @click="toggleExpandInfo">
      <v-icon :color="iconColor" size="24">{{ iconType }}</v-icon>
      <div style="overflow: hidden;" class="ml-2 pr-2">
        <div :class="['d-flex', iconTextClass]">
          <span class="text-truncate mr-1">{{ displayAmount }}</span> {{ tokenHydrated.symbol }}
        </div>
      </div>
      <v-spacer></v-spacer>
      <div class="text-end">
        <template v-if="isLinearLock">
          <span :class="['d-inline-flex primary--text align-center caption ml-1 br-20']">
            Linear lock
            <v-icon small color="primary" class="ml-1">mdi-chart-line</v-icon>
          </span>
        </template>
        <div :class="['font-weight-medium caption', iconTextClass]">{{ endEmissionFromNow }}</div>
        <v-progress-linear
          v-if="!epochHasPassed"
          striped reverse rounded height="4"
          :value="unlockProgress"
          :color="progressColor"
          background-color="outline"
          style="width: 100px;">
        </v-progress-linear>
      </div>
      <div class="d-flex flex-column align-center justify-center">
        <v-menu v-if="sClient.address && !disableDialogs" offset-y left>
          <template v-slot:activator="{ attrs, on }">
            <v-btn
              v-bind="attrs"
              icon small :color="menuButtonColor"
              v-on="on">
              <v-icon small>mdi-settings-outline</v-icon>
            </v-btn>
          </template>
          <v-list style="min-width: 200px;" class="background">
            <v-list-item v-if="isOwner" @click="$emit('withdraw', item)">
              <v-list-item-title>Withdraw</v-list-item-title>
              <v-icon class="ml-1">mdi-arrow-up</v-icon>
            </v-list-item>
            <v-list-item v-if="isOwner" @click="$emit('relock', item)">
              <v-list-item-title>Relock</v-list-item-title>
              <v-icon class="ml-1">mdi-update</v-icon>
            </v-list-item>
            <v-list-item v-if="isOwner" @click="$emit('transfer-ownership', item)">
              <v-list-item-title>Transfer ownership</v-list-item-title>
              <v-icon class="ml-1">mdi-account-outline</v-icon>
            </v-list-item>
            <v-list-item @click="$emit('increment', item)">
              <v-list-item-title>Lock More Tokens</v-list-item-title>
              <v-icon class="ml-1">mdi-plus</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-icon style="display: block;" small color="textFaint" :class="chevronClass">mdi-chevron-down</v-icon>
      </div>
    </div>
    <v-expand-transition>
      <div v-if="expandInfo" class="background">
        <div class="pa-3">
          <div class="caption textFaint--text font-italic">Lock id: {{ item.lock_id }}</div>
          <div class="caption textFaint--text">Owner: {{ condensedAddress }}</div>
        </div>
        <div v-if="isLinearLock" class="pa-3">
          <v-row>
            <v-col cols="6">
              <div class="font-weight-bold caption">
                <span class="caption">Start emission</span> {{ startEmissionFromNow }}
              </div>
              <div class="caption textFaint--text">{{ startEmissionHuman }}</div>
            </v-col>
            <v-col cols="6" class="text-end">
              <div class="font-weight-bold caption">
                <span class="caption">End emission</span> {{ endEmissionFromNow }}
              </div>
              <div class="caption textFaint--text">{{ endEmissionHuman }}</div>
            </v-col>
          </v-row>
          <linear-lock-chart :lock="chartItem" :tokenHydrated="tokenHydrated"></linear-lock-chart>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import moment from 'moment';
import LinearLockChart from '@/views/locker/erc20/charts/linear-lock';

export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    disableDialogs: {
      type: Boolean,
      default: false
    },
    network: {
      type: String,
      default: null
    }
  },
  components: {
    LinearLockChart
  },
  data: () => ({
    expandInfo: false
  }),
  computed: {
    cNetwork() {
      return this.network ? this.network : this.$store.state.requiredNetwork;
    },
    sClient() {
      return this.$store.state.signer;
    },
    chartItem() {
      return {
        amount: this.item.tokens_deposited,
        start_emission: this.item.start_emission,
        end_emission: this.item.end_emission
      };
    },
    condensedAddress() {
      const address = this.item.owner;
      return address ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}` : '';
    },
    unlockProgress() {
      const now = moment().unix();
      return ((this.item.end_emission - now) * 100) / 10368000; // 4 months
    },
    isLinearLock() {
      return this.item.start_emission !== 0;
    },
    iconType() {
      if (this.amountRemaining === '0') return 'mdi-check-circle-outline';
      if (this.epochHasPassed) return 'mdi-lock-open-outline';
      return 'mdi-lock';
    },
    iconColor() {
      if (this.amountRemaining === '0' || this.epochHasPassed) return 'textFaint';
      return 'primary';
    },
    iconTextClass() {
      if (this.amountRemaining === '0' || this.epochHasPassed) return 'textFaint--text';
      return 'primary--text';
    },
    displayAmount() {
      return this.$root.formatAmount(this.amountRemaining, this.tokenHydrated.decimals);
    },
    progressColor() {
      return this.unlockProgress >= 20 ? 'primary' : 'primary';
    },
    chevronClass() {
      return { 'rotate-180': this.expandInfo };
    },
    menuButtonColor() {
      return this.sClient.address === this.item.owner ? 'primary' : 'textFaint';
    },
    isOwner() {
      return this.sClient.address === this.item.owner;
    },
    epochHasPassed() {
      return this.item.end_emission < moment().unix();
    },
    endEmissionFromNow() {
      return moment.unix(this.item.end_emission).isValid() ? moment.unix(this.item.end_emission).fromNow() : '';
    },
    endEmissionHuman() {
      return moment.unix(this.item.end_emission).isValid() ? moment.unix(this.item.end_emission).format('D MMMM YYYY, HH:mm') : '';
    },
    startEmissionFromNow() {
      return moment.unix(this.item.start_emission).isValid() ? moment.unix(this.item.start_emission).fromNow() : '';
    },
    startEmissionHuman() {
      return moment.unix(this.item.start_emission).isValid() ? moment.unix(this.item.start_emission).format('D MMMM YYYY, HH:mm') : '';
    },
    amountRemaining() {
      return (this.item.tokens_deposited - this.item.tokens_withdrawn).toString();
    }
  },
  methods: {
    toggleExpandInfo() {
      this.expandInfo = !this.expandInfo;
    }
  }
};
</script>
