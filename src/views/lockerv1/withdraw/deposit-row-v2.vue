<template>
  <div :class="['v-card pa-6 mb-6 br-20', {'grad-green white--text': epochHasPassed}]">
    <v-icon v-if="epochHasPassed" size="130" style="color: rgba(0,0,0,0.05)!important; position: absolute; right: -30px; top: 20px;">mdi-lock-open-outline</v-icon>
    <v-icon v-else size="80" style="color: var(--v-background-base)!important; position: absolute; right: -30px; top: 30px;">mdi-lock-outline</v-icon>

    <div style="position: relative;">
      <div class="d-flex align-center">
        <div class="">
          <div class="title font-weight-bold">
            {{ percentOfTotal }}% {{ epochHasPassed ? 'UNLOCKED' : 'LOCKED' }}
          </div>
          <div class="caption">
            {{ depositAmountHuman }} LP
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-menu offset-y left>
          <template v-slot:activator="{ attrs, on }">
            <v-btn icon :color="epochHasPassed ? 'white' : ''" v-bind="attrs" large v-on="on">
              <v-icon>mdi-settings</v-icon>
            </v-btn>
          </template>
          <v-list style="min-width: 200px;" class="background">
            <v-list-item @click="$emit('relock', item)">
              <v-list-item-title>Relock</v-list-item-title>
              <v-icon class="ml-1">mdi-update</v-icon>
            </v-list-item>
            <v-list-item @click="$emit('transfer-ownership', item)">
              <v-list-item-title>Transfer ownership</v-list-item-title>
              <v-icon class="ml-1">mdi-account-outline</v-icon>
            </v-list-item>
            <v-list-item @click="$emit('increment', item)">
              <v-list-item-title>Lock More Tokens</v-list-item-title>
              <v-icon class="ml-1">mdi-plus</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-btn v-if="epochHasPassed" x-large depressed rounded block color="white" class="text-uppercase mt-4" @click="$emit('withdraw', item)">
        <span style="color: #4AB2A4;">Withdraw</span>
      </v-btn>

      <div v-if="!epochHasPassed" class="d-flex mt-4 align-center">
        <div class="">
          {{ dateSimple }}
        </div>
        <v-spacer></v-spacer>
        <div class="caption textMid--text">
          {{ dateFromNow }} - #{{ item.lockid }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import moment from 'moment'
import Utils from '@/web3/utils.js'

interface LockItem {
  amount: string
  unlock_date: number
  lockid: string
  user_lock_index: number
}

const props = defineProps<{
  item: LockItem
  totalSupply: string
}>()

const depositAmountHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(props.item.amount, 6)
  const decimals = amount > 1 ? 2 : amount > 0.0001 ? 6 : 18
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
})

const dateFromNow = computed(() => {
  if (moment.unix(props.item.unlock_date).isValid()) {
    return moment.unix(props.item.unlock_date).fromNow()
  }
  return ''
})

const dateSimple = computed(() => {
  if (moment.unix(props.item.unlock_date).isValid()) {
    return moment.unix(props.item.unlock_date).format('ddd D MMM YYYY HH:mm')
  }
  return ''
})

const percentOfTotal = computed(() => {
  const locked = Number(props.item.amount) / Math.pow(10, 6)
  const total = Number(props.totalSupply) / Math.pow(10, 6)
  const division = (locked / total) * 100
  const maxDecimals = division > 1 ? 1 : 2
  return Number(division).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals })
})

const epochHasPassed = computed(() => props.item.unlock_date < moment().unix())
</script>
