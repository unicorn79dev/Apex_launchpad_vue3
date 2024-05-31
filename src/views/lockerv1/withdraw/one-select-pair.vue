<template>
  <div>
    <v-icon size="160" style="color: #000000!important; position: absolute; right: 50%; margin-right: -300px;">mdi-arrow-up-circle-outline</v-icon>

    <div style="position: relative;" class="mx-5">
      <div class="display-1 textFaint--text font-weight-bold mb-8 mt-5" style="font-size: 36px;">
        Edit / Withdraw
      </div>

      <div v-if="!sClient.address" class="mt-12 text-center">
        <v-btn
          @click="connectWallet"
          outlined
          :class="['font-weight-bold mb-4', { 'purple-button white--text': !sClient.address }]"
          rounded
          depressed
        >
          <span v-if="!sClient.address">Connect Wallet</span>
          <span v-else>Account: {{ sClient.address_condensed }}</span>
        </v-btn>
      </div>

      <template v-else>
        <div class="mt-8">
          Enter the pair address you would like to access
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <!-- <c-input :value.sync="searchPair" :placeholder="`pair address...`" class="heading--text"></c-input> -->
          <c-input v-model:value="searchPair" :placeholder="`pair address...`" class="heading--text"></c-input>
        </div>

        <div class="caption textFaint--text">
          e.g. inj70bb2736e218861dca818d1e9f7a1930fe61e5b
        </div>

        <div v-if="loadingPair" class="mt-4 mb-4 text-center">
          <v-progress-circular indeterminate size="60" color="primary"></v-progress-circular>
          <div>Finding pair</div>
        </div>

        <div v-if="lpAddress">
          <div class="mt-8 pt-2 pb-2 t-large">Pair found</div>

          <v-btn @click="$emit('on-continue', lpAddress)" depressed rounded color="primary" block x-large class="mt-6">
            Continue
          </v-btn>
        </div>

        <user-locked-pairs @on-select="onSelectLockedPair" :key="sClient.address" class="mt-8"></user-locked-pairs>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useStore } from 'vuex'
import UserLockedPairs from '@/views/lockerv1/account/locked-pairs'
import Utils from '@/web3/utils'


const connectwallet = inject('connectwallet');
const searchPair = ref('')
const lpAddress = ref(null)
const balance = ref('0')
const loadingPair = ref(false)

const store = useStore()

const sClient = computed(() => store.state.signer)
const searchTextIsAddress = computed(() => Utils.isValidAddress(searchPair.value))

const connectWallet = () => {
  // store.dispatch('openDialog', { type: 'connectWalletDialog' })
  connectwallet()
}

const onSelectLockedPair = (unipair) => {
  emit('on-continue', unipair)
}

const getUniBalance = async () => {
  const balanceQuery = {
    balance: { address: sClient.value.address },
  }

  let balanceResult = 0
  try {
    balanceResult = await sClient.value.client.queryContractSmart(searchPair.value, balanceQuery)
    lpAddress.value = searchPair.value
    console.log('LP Balance', balanceResult.balance)
  } catch (err) {
    console.log(err)
    console.log('Not LP/Token address')
  }

  if (balanceResult > 0) {
    balance.value = balanceResult
  }
}

const loadDexPair = (address) => {
  console.log(address)
  loadingPair.value = true

  getUniBalance()
  
  loadingPair.value = false
}

watch(searchPair, (newVal) => {
  if (searchTextIsAddress.value) {
    console.log('Address checked!!!')
    loadDexPair(newVal)
  } else {
    lpAddress.value = null
  }
})

const emit = defineEmits(['on-continue'])

const uniBalanceHuman = computed(() => 0)

// created(() => {
//   searchPair.value = ''
// })
</script>
