<template>
  <div :class="['d-flex align-center border-b pt-2 pb-2', {'textFaint--text': epochHasPassed}]">
    <div>
      <div :class="['font-weight-bold', {'primary--text': item.v2}]">
        {{ amountHuman }}
      </div>
      <!-- <div class="caption textFaint--text">
        {{ amountHuman }} LP token
      </div> -->
    </div>
    <v-spacer></v-spacer>
    <div class="text-end">
      <div class="font-weight-bold">
        {{ dateFromNow }}
      </div>
      <div class="caption textFaint--text">
        {{ dateSimple }}
      </div>
    </div>
    <v-icon class="ml-3" color="textFaint" v-if="epochHasPassed">mdi-lock-open-outline</v-icon>
    <v-icon class="ml-3" color="primary" v-else>mdi-lock</v-icon>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import moment from 'moment'
import Utils from '@/web3/utils'

const props = defineProps({
  item: Object,
  reserveUSD: {
    type: String
  },
  totalSupply: {
    type: String
  }
})

const percent = computed(() => {
  return 10
  // if (props.totalSupply === '0') {
  //   return 0
  // }
  // const perc = ethers.BigNumber.from(props.item.amount).mul(10000000000).div(props.totalSupply)
  // return perc / 10000000000
})

const dollarValue = computed(() => {
  return 10
  // const value = props.reserveUSD * percent.value
  // return Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
})

const amountHuman = computed(() => {
  console.log("Locked amount = ", props.item.amount)
  const amount = Utils.convertMicroDenomToDenom(props.item.amount, 6)
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
})

const dateFromNow = computed(() => {
  if (moment.unix(props.item.unlock_date).isValid()) {
    return moment.unix(props.item.unlock_date).fromNow()
  }
  return ''
})

const dateSimple = computed(() => {
  if (moment.unix(props.item.unlock_date).isValid()) {
    return moment.unix(props.item.unlock_date).format('DD/MM/YYYY HH:mm')
  }
  return ''
})

const epochHasPassed = computed(() => {
  return true
  // return props.item.unlock_date < moment().unix()
})
</script>
