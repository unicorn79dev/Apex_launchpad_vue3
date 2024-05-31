<template>
  <div>
    <div class="c-list pa-4" @click="expandInfo = !expandInfo">
      <div class="d-flex align-center">
        {{ item.address }}
        <v-spacer></v-spacer>
        <v-icon small color="textFaint" :class="{ 'rotate-180': expandInfo }">mdi-chevron-down</v-icon>
      </div>
    </div>

    <v-expand-transition>
      <div v-if="expandInfo" class="background">
        <div class="text-center mt-1">
          <v-btn color="textFaint" rounded text :href="'https://scanlink'" target="_blank">
            Explorer
            <v-icon x-small>mdi-arrow-top-right</v-icon>
          </v-btn>
          
          <router-link :to="`/browser/pair/${item.address}`" :item="item">
            <v-btn rounded text color="textFaint">
              View lock page
            </v-btn>
          </router-link>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'

const props = defineProps({
  item: Object,
  index: {
    type: Number,
    default: null
  },
  exchange: null
})

const expandInfo = ref(false)
const liveStats = ref({
  reserveUSD: '0',
  totalSupply: '0'
})
const totalSupply = ref('0')
const loadReserve = ref(true)
const loadReserveFailed = ref(false)
const refreshReservesLoading = ref(false)
const reserves = ref({
  reserve0: '0',
  reserve1: '0'
})

const dextLink = computed(() => null)
const cNetwork = computed(() => 'SEI')
const cExchange = computed(() => true)
const token0Symbol = computed(() => 'XXX')
const token1Symbol = computed(() => 'YYY')
const percentLocked = computed(() => 0)
const dollarValueLive = computed(() => 0)
const dollarValueLiveHuman = computed(() => 0)
const dollarValueDatabase = computed(() => 0)
const dateFromNow = computed(() => {
  if (moment.unix(props.item.next_unlock).isValid() && props.item.next_unlock !== '0') {
    return moment.unix(props.item.next_unlock).fromNow()
  }
  return null
})
const reserveUSDHuman = computed(() => 0)
const reserve0Human = computed(() => 0)
const reserve1Human = computed(() => 0)

const openTokenPage = (address) => {
  this.$root.tokenPage.open(address, cNetwork.value, cExchange.value)
}

const getBlockchainSupply = async () => {
  // get total supply from the blockchain if the graph api is down
}

const getReserves = async () => {}

const getLiveStats = async () => {}

watch(() => props.item.address, () => {
  // getLiveStats()
})
</script>
