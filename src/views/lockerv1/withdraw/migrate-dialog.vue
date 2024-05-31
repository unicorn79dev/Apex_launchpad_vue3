<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-card-text>
        <v-row class="ma-0 py-4 align-center">
          <div>
            Migrate Liquidity {{ ammMigrateTo }}
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div v-if="!pairComparator.doneLoading" class="caption my-2 textFaint--text text-center">
          Loading...
        </div>

        <v-expand-transition>
          <div v-show="pairComparator.doneLoading" class="pa-0">
            <v-btn
              class="mb-5 white--text"
              block
              depressed
              color="orange"
              rounded
              href="https://docs.unicrypt.network/liquidity-lockers/migration-of-pancakeswap-liquidity-from-v1-to-v2"
              target="_blank"
            >
              README: Migration documentation
            </v-btn>

            <div class="d-flex align-center textFaint--text caption font-italic">
              Pancakeswap V1
              <v-spacer></v-spacer>
              <v-progress-circular v-if="loading" indeterminate width="2" class="mr-2" size="12" color="text"></v-progress-circular>
            </div>
            <div class="d-flex align-center">
              <div class="d-flex align-center border pr-3 background br-20">
                <coin-icon :address="sortedToken0.address" class="mr-2"></coin-icon>
                1 {{ sortedToken0.symbol }}
              </div>
              <div class="mx-2">=</div>
              <div class="d-flex align-center border pr-3 background br-20">
                <coin-icon :address="sortedToken1.address" class="mr-2"></coin-icon>
                {{ sortedV1Price }} {{ sortedToken1.symbol }}
              </div>
            </div>

            <div class="textFaint--text caption font-italic mt-3">Pancakeswap V2</div>
            <template v-if="pairComparator.v2PairExists === 1">
              <div class="d-flex align-center">
                <div class="d-flex align-center border pr-3 background br-20">
                  <coin-icon :address="sortedToken0.address" class="mr-2"></coin-icon>
                  1 {{ sortedToken0.symbol }}
                </div>
                <div class="mx-2">=</div>
                <div class="d-flex align-center border pr-3 background br-20">
                  <coin-icon :address="sortedToken1.address" class="mr-2"></coin-icon>
                  {{ sortedV2Price }} {{ sortedToken1.symbol }}
                </div>
              </div>

              <div class="border br-20 pa-2 mt-2">
                <div class="caption font-italic textFaint--text">V1 Pool</div>
                <div class="d-flex align-center">
                  <coin-icon :address="unipair.token0.address" class="mr-2"></coin-icon>
                  {{ $root.formatAmount(reservesV1.reserve0, unipair.token0.decimals) }}
                </div>
                <div class="d-flex align-center">
                  <coin-icon :address="unipair.token1.address" class="mr-2"></coin-icon>
                  {{ $root.formatAmount(reservesV1.reserve1, unipair.token1.decimals) }}
                </div>
              </div>

              <div class="border br-20 pa-2 mt-2">
                <div class="caption font-italic textFaint--text">V2 Pool</div>
                <div class="d-flex align-center">
                  <coin-icon :address="unipair.token0.address" class="mr-2"></coin-icon>
                  {{ $root.formatAmount(reservesV2.reserve0, unipair.token0.decimals) }}
                </div>
                <div class="d-flex align-center">
                  <coin-icon :address="unipair.token1.address" class="mr-2"></coin-icon>
                  {{ $root.formatAmount(reservesV2.reserve1, unipair.token1.decimals) }}
                </div>
              </div>

              <div class="text-center mt-3">
                <strong :class="pairComparator.priceDiff > 4.5 ? 'orange--text' : ''">{{ pairComparator.priceDiff }}%</strong>
                <div class="textFaint--text caption font-italic">Price Difference</div>
              </div>
              <div v-if="pairComparator.priceDiff > 4.5" class="py-2 caption orange--text font-italic">
                There is a high price difference between the two pairs. Migration may fail. Try to balance the pairs before migration. Recommended price
                difference is 5% Max
              </div>
            </template>
            <div v-else class="caption primary--text">
              <v-icon small color="primary">mdi-check-circle-outline</v-icon>
              No Pair on Pancakeswap V2
            </div>
          </div>
        </v-expand-transition>

        <div class="pa-1">
          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">Migrateable: {{ withdrawableBalanceHuman }}</div>
              <div class="d-flex align-center">
                <!-- <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold"></c-input> -->
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold"></c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>
        </div>
      </v-card-text>

      <div class="caption pa-4 font-italic textFaint--text">
        Any dust amounts of either of the tokens (up to 5% slippage) that does not fit into the new liquidity pool is sent to your wallet.
      </div>

      <div class="text-center mb-3">
        Migration Fee: 1%
      </div>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block depressed @click="migrate" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Migrate
          <v-icon class="ml-2">mdi-arrow-right</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ethers } from 'ethers'
import CInput from '@/components/ui/input'
import TxWrapper from '@/smart-contracts/tx-wrapper'
import LockerContract from '@/smart-contracts/lock-uni-v2/univ2-contract'
import V2PAIR from '@/smart-contracts/uniswap/v2-pair'
import V2FACTORY from '@/smart-contracts/uniswap/uniswap-factory-contract'

const dialog = ref(false)
const resolve = ref(null)
const reject = ref(null)
const amount = ref('0')
const amountHuman = ref('0')
const loading = ref(false)
const withdrawLoading = ref(false)
const lock = ref({
  amount: '0'
})
const unipair = ref({
  token0: {},
  token1: {}
})
const reservesV1 = ref({})
const reservesV2 = ref({})
const pairComparator = ref({
  v2PairExists: -1,
  price_v1_token0: '0',
  price_v1_token1: '0',
  price_v2_token0: '0',
  price_v2_token1: '0',
  priceDiff: 0,
  doneLoading: false
})
const lastSync = ref(0)

const store = useStore()

const blockNumber = computed(() => store.state.blockNumber)

const sortedToken0 = computed(() => {
  return higherValueToken.value === 0 ? unipair.value.token0 : unipair.value.token1
})

const sortedToken1 = computed(() => {
  return higherValueToken.value === 0 ? unipair.value.token1 : unipair.value.token0
})

const sortedV1Price = computed(() => {
  if (!pairComparator.value.doneLoading) {
    return 0
  }
  const price = higherValueToken.value === 0 ? pairComparator.value.price_v1_token1 : pairComparator.value.price_v1_token0
  return store.state.formatAmount(price, higherValueToken.value === 0 ? unipair.value.token1.decimals : unipair.value.token0.decimals)
})

const sortedV2Price = computed(() => {
  if (!pairComparator.value.doneLoading) {
    return 0
  }
  const price = higherValueToken.value === 0 ? pairComparator.value.price_v2_token1 : pairComparator.value.price_v2_token0
  return store.state.formatAmount(price, higherValueToken.value === 0 ? unipair.value.token1.decimals : unipair.value.token0.decimals)
})

const higherValueToken = computed(() => {
  if (!pairComparator.value.doneLoading) {
    return 0
  }
  return ethers.BigNumber.from(pairComparator.value.price_v1_token0).div(ethers.BigNumber.from(10).pow(unipair.value.token0.decimals)).gt(1) ? 1 : 0
})

const ammMigrateTo = computed(() => {
  if (store.state.exchange === 'Pancakeswap V1') {
    return 'V1 -> V2'
  }
  return '?'
})

const sEthers = computed(() => store.state.ethers)

const withdrawableBalanceHuman = computed(() => {
  const amount = ethers.utils.formatUnits(lock.value.amount, 18)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})

watch(blockNumber, () => {
  const now = Math.round(new Date() / 1000)
  const elapsed = now - lastSync.value
  if (elapsed >= 8) {
    lastSync.value = now
    refresh()
  }
})

const open = (lockVal, unipairVal) => {
  pairComparator.value = {
    v2PairExists: -1,
    price_v1_token0: '0',
    price_v1_token1: '0',
    price_v2_token0: '0',
    price_v2_token1: '0',
    priceDiff: 0,
    doneLoading: false
  }
  lock.value = lockVal
  unipair.value = unipairVal
  dialog.value = true
  refresh()
  return new Promise((res, rej) => {
    resolve.value = res
    reject.value = rej
  })
}

const setMax = () => {
  amount.value = lock.value.amount
  amountHuman.value = ethers.utils.formatUnits(lock.value.amount, 18)
}

const cancel = () => {
  reject.value()
  dialog.value = false
  pairComparator.value.doneLoading = false
}

const refresh = async () => {
  if (!dialog.value) {
    return
  }
  loading.value = true
  reservesV1.value = await V2PAIR.getReserves(unipair.value.address)
  const v2PairAddress = await V2FACTORY.getPair(unipair.value.token0.address, unipair.value.token1.address, '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73')
  pairComparator.value.v2PairExists = v2PairAddress === ethers.constants.AddressZero ? 0 : 1

  pairComparator.value.price_v1_token0 = ethers.BigNumber.from(ethers.BigNumber.from(10).pow(unipair.value.token1.decimals)).mul(reservesV1.value.reserve0).div(reservesV1.value.reserve1)
  pairComparator.value.price_v1_token1 = ethers.BigNumber.from(ethers.BigNumber.from(10).pow(unipair.value.token0.decimals)).mul(reservesV1.value.reserve1).div(reservesV1.value.reserve0)

  if (pairComparator.value.v2PairExists) {
    reservesV2.value = await V2PAIR.getReserves(v2PairAddress)

    pairComparator.value.price_v2_token0 = ethers.BigNumber.from(ethers.BigNumber.from(10).pow(unipair.value.token1.decimals)).mul(reservesV2.value.reserve0).div(reservesV2.value.reserve1)
    pairComparator.value.price_v2_token1 = ethers.BigNumber.from(ethers.BigNumber.from(10).pow(unipair.value.token0.decimals)).mul(reservesV2.value.reserve1).div(reservesV2.value.reserve0)

    let priceDifference
    if (pairComparator.value.price_v1_token0.gte(pairComparator.value.price_v2_token0)) {
      priceDifference = pairComparator.value.price_v1_token0.sub(pairComparator.value.price_v2_token0)
      priceDifference = priceDifference.mul(10000).div(pairComparator.value.price_v2_token0).toString()
    } else {
      priceDifference = pairComparator.value.price_v2_token0.sub(pairComparator.value.price_v1_token0)
      priceDifference = priceDifference.mul(10000).div(pairComparator.value.price_v1_token0).toString()
    }
    pairComparator.value.priceDiff = Number(priceDifference / 100)
  }
  pairComparator.value.doneLoading = true
  loading.value = false
}

const onHumanAmountChange = (val) => {
  amount.value = ethers.utils.parseUnits(val, 18)
}

const migrate = () => {
  withdrawLoading.value = true
  TxWrapper.doTransaction(LockerContract.migrate(unipair.value.address, lock.value.user_lock_index, lock.value.lockID, amount.value), store.state.dialog.confirmTx)
    .then(() => {
      resolve.value()
      dialog.value = false
    })
    .catch((e) => {
      store.state.dialog.web3Error.open(e.message)
    })
    .then(() => {
      withdrawLoading.value = false
    })
}
</script>
