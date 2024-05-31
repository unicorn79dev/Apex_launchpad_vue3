<template>
  <div class="r-border-b mb-1">
    <div class="pt-2 pb-2 border-b">
      <div>
        {{ depositAmountHuman }} UNi-V2
      </div>
      <div>
        {{ dateSimple }}
      </div>
      <div class="caption textMid--text">
        {{ dateFromNow }} - #{{ lock.lockID }}
      </div>
      <div class="caption ma-2">
        {{ lock }}
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment'
import { ethers } from 'ethers'
import { computed } from 'vue'

const props = defineProps({
  lock: {
    type: Object,
    default: () => ({})
  },
  totalSupply: {
    type: String,
    default: '0'
  }
})

const depositAmountHuman = computed(() => {
  const amount = ethers.utils.formatUnits(props.lock.amount, 18)
  let decimals = 18
  if (amount > 1) {
    decimals = 2
  } else if (amount > 0.0001) {
    decimals = 6
  } else if (amount < 0.000000001) {
    decimals = 18
  }
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
})

const dateFromNow = computed(() => {
  if (moment.unix(props.lock.unlock_date).isValid()) {
    return moment.unix(props.lock.unlock_date).fromNow()
  }
  return ''
})

const dateSimple = computed(() => {
  if (moment.unix(props.lock.unlock_date).isValid()) {
    return moment.unix(props.lock.unlock_date).format('ddd D MMM YYYY HH:mm')
  }
  return ''
})

const epochHasPassed = computed(() => {
  return props.lock.unlock_date < moment().unix()
})
</script>
