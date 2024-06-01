<!-- <template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card>
      <v-card-text>
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">Withdraw Liquidity</div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <div class="pa-1">
          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">Withdrawable: {{ withdrawableBalanceHuman }}</div>
              <div class="d-flex align-center">
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold"></c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">MAX</v-btn>
              </div>
            </div>
          </template>
        </div>
      </v-card-text>
      <v-row dense class="ma-2">
        <v-btn x-large rounded block @click="withdraw" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Withdraw
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import CInput from '@/components/ui/input'
import Utils from '@/web3/utils'
import SETTINGS from '@/store/settings'

const props = defineProps({
  uniPair: String,
})

const dialog = ref(false)
const decimals = ref(6)
const amount = ref('0')
const amountHuman = ref('0')
const withdrawLoading = ref(false)
const lock = ref({
  amount: '0',
})
const unipair = ref(null)

const sClient = computed(() => useStore().state.signer)
const reqNetwork = computed(() => useStore().state.requiredNetwork)

const withdrawableBalanceHuman = computed(() => {
  const amountValue = Utils.convertMicroDenomToDenom(lock.value.amount, decimals.value)
  return Number(amountValue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})

const open = (_lock, _unipair) => {
  lock.value = _lock
  unipair.value = _unipair
  dialog.value = true
  return new Promise((resolve, reject) => {
    resolveRef.value = resolve
    rejectRef.value = reject
  })
}

const setMax = () => {
  amount.value = lock.value.amount
  amountHuman.value = Utils.convertMicroDenomToDenom(lock.value.amount, decimals.value)
}

const cancel = () => {
  rejectRef.value()
  dialog.value = false
}

const onHumanAmountChange = (val) => {
  amount.value = Utils.convertDenomToMicroDenom(val, decimals.value)
}

const withdraw = async () => {
  withdrawLoading.value = true
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        withdraw: {
          lptoken: unipair.value,
          index: lock.value.user_lock_index,
          lockid: lock.value.lockid,
          amount: amount.value,
        },
      },
      defaultFee,
      undefined,
      []
    )

    resolveRef.value()
    dialog.value = false
    console.log('lock txhash: ', txhash)
  } catch (err) {
    console.error(err)
    this.$root.$dialog.web3Error.open(err.message)
  }

  withdrawLoading.value = false
}

const resolveRef = ref(null)
const rejectRef = ref(null)
</script> -->


<template>
  <div>
    <withdraw-v2 :uniPair="uniPair"></withdraw-v2>
  </div>

</template>

<script>
import WithdrawV2 from './withdraw-v2'

export default {
  components: {
    WithdrawV2,
  },

  props: {
    uniPair: String
  },

  data: () => ({
    version: 1
  }),

  methods: {
  }
}
</script>