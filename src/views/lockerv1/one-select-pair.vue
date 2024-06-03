<template>
  <div class="px-2 py-3">
    <v-icon size="120" style="color: #000000!important; position: absolute; right: 50%; margin-right: -250px; margin-top: -40px;">mdi-lock-outline</v-icon>
    <div style="position: relative;" class="pt-0">
      <div class="d-flex align-center title font-weight-bold mb-4" style="font-size: 20px;">
        New Lock
      </div>
      <div class="mb-2">
        Use the locker to prove to investors you have locked liquidity. If you are not a token developer, this section is almost definitely not for you.
      </div>
      <div>
        Our locker offers:
        <ul>
          <li>Relocking</li>
          <li>Lock ownership transfer</li>
        </ul>
      </div>
      <div v-if="!sClient.address" class="mt-6 text-center">
        <v-btn @click="connectWallet" color="text" class="border" :class="['font-weight-bold mb-4']" rounded depressed>
        <!-- <v-btn to="/connect-wallet" outlined color="primary" :class="['font-weight-bold mb-4']" rounded depressed> -->
          <span v-if="!sClient.address" style="color:#5b72c1;">Connect Wallet</span>
          <span v-else>Account: {{ sClient.address_condensed }}</span>
        </v-btn>
      </div>
      <template v-else class="position-relative">
        <div class="mt-8">
          Enter the pair address you would like to lock liquidity for
        </div>
        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor" style="position: relative;">
          <v-text-field v-model="searchPair" placeholder="pair address..." type="input" class="br-20" variant="solo" rounded="pill"></v-text-field>
          <!-- <c-input v-model="searchPair" placeholder="pair address..." class="br-20"></c-input> -->
        </div>
        <div class="caption text-center textFaint--text" style="font-size: smaller;">
          e.g. inj16ukv8g2jcmml7gykxn5ws8ykhxjkugl4zhft5h
        </div>
        <div v-if="loadingPair" class="mt-4 mb-4 text-center">
          <v-progress-circular indeterminate size="60" color="primary">
            <v-icon>mdi-lock</v-icon>
          </v-progress-circular>
          <div>
            Finding pair
          </div>
        </div>
        <v-slide-y-transition>
          <div v-if="lpAddress" class="border-sm pa-4 br-20 mt-4">
            <div class="pb-2 t-large">
              Pair found
            </div>
            <v-btn @click="$emit('on-continue', lpAddress)" depressed rounded color="#9683c2" block size="x-large" class="mt-6">
              <span>CONTINUE</span>
            </v-btn>
          </div>
        </v-slide-y-transition>
        <user-locked-pairs @on-select="onSelectLockedPair" :key="sClient.address" class="mt-8"></user-locked-pairs>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import UserLockedPairs from '@/views/lockerv1/account/locked-pairs'
import Utils from '@/web3/utils'
import {useStore} from 'vuex'
import { useRoute } from 'vue-router'
import CInput from '@/components/ui/input';

const router = useRoute();

const connectwallet = inject('connectwallet');


const searchPair = ref('')
const lpAddress = ref(null)
const balance = ref('0')
const loadingPair = ref(false)

const sClient = computed(() => useStore().state.signer)
const searchTextIsAddress = computed(() => Utils.isValidAddress(searchPair.value))

watch(searchPair, (nv) => {
  if (searchTextIsAddress.value) {
    loadDexPair(nv)
  } else {
    lpAddress.value = null
  }
})

const loadDexPair = async (address) => {
  loadingPair.value = true
  await getLPTokenBalance()
  loadingPair.value = false
}

const onSelectLockedPair = (unipair) => {
  emit('on-continue', unipair)
}

const getLPTokenBalance = async () => {
  const balanceQuery = { balance: { address: sClient.value.address } }
  let balanceValue = 0
  try {
    const balanceResponse = await sClient.value.client.queryContractSmart(searchPair.value, balanceQuery)
    lpAddress.value = searchPair.value
    balanceValue = balanceResponse.balance
  } catch (err) {
    console.error("Not LP/Token address", err)
  }
  if (balanceValue > 0) {
    balance.value = balanceValue
  }
}

const connectWallet = () => {
  // $root.$dialog.connectWalletDialog.open().then(() => {}).catch(e => {})
  if (app) {
    // app.router.push('/connect-wallet');
    // app.$dialog.connectWalletDialog.open().then(() => {}).catch(e=>{})
    connectwallet();
  }
}

onMounted(() => {
  searchPair.value = '';
  CInput
})
</script>
