<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-card-text>
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">Relock Liquidity</div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">Current lock date</div>
        <div>{{ currentLockDateHuman }}</div>

        <div class="mt-10">New Unlock Date</div>
        <div class="d-flex align-center inputcolor r-outlined pa-4">
          <div>
            <div class="font-weight-bold title">{{ unlockDateHuman }}</div>
            <div class="textFaint--text">
              {{ unlockDateFromNow }} (unix {{ unlockDate }})
            </div>
          </div>
          <v-spacer></v-spacer>
          <c-date @setDate="setUnlockDate"></c-date>
        </div>

        <div v-if="lockDateInvalid" class="text-center pink--text">
          Lock date needs to be after current lock date
        </div>

        <div class="text-center mt-3">Fee: {{ `${liquidityFee} ${reqNetwork}` }}</div>
      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large block rounded @click="relock" class="white--text grad-green" :loading="withdrawLoading">
          Relock
          <v-icon class="ml-2">mdi-lock-outline</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import CDate from '@/components/ui/date-picker'
import Utils from '@/web3/utils'
import SETTINGS from '@/store/settings'

const dialog = ref(false)
const unlockDate = ref('0')
const amount = ref('0')
const amountHuman = ref('0')
const loading = ref(true)
const withdrawLoading = ref(false)
const lock = ref({})
const unipair = ref({})
const feeInfo = ref({})

const store = useStore()

const sClient = computed(() => store.state.signer)
const reqNetwork = computed(() => store.state.requiredNetwork)

const withdrawableBalanceHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(lock.value.amount, 6)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})

const currentLockDateHuman = computed(() => moment.unix(lock.value.unlock_date).format('ddd D MMM YYYY HH:mm'))

const unlockDateHuman = computed(() => moment.unix(unlockDate.value).format('ddd D MMM YYYY HH:mm'))

const unlockDateFromNow = computed(() => moment.unix(unlockDate.value).fromNow())

const lockDateInvalid = computed(() => Number(unlockDate.value) <= Number(lock.value.unlock_date))

const ethFee = computed(() => {
  const months = parseInt((unlockDate.value - moment.now() / 1000) / 2628000 + 1)
  const totalFee = feeInfo.value.mfee * months
  return totalFee
})

const liquidityFee = computed(() => 2.5)

const open = (lockVal, unipairVal) => {
  lock.value = lockVal
  unipair.value = unipairVal
  unlockDate.value = lockVal.unlock_date
  dialog.value = true
  return new Promise((resolve, reject) => {
    resolveRef.value = resolve
    rejectRef.value = reject
  })
}

const cancel = () => {
  rejectRef.value()
  dialog.value = false
}

const setUnlockDate = (date) => {
  unlockDate.value = date.unix()
}

const onHumanAmountChange = (val) => {
  amount.value = Utils.convertDenomToMicroDenom(val, 6)
}

const getFees = async () => {
  feeInfo.value = { fee: 750000, mfee: 250000 }
}

const relock = async () => {
  withdrawLoading.value = true
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  store.commit('openDialog', { type: 'confirmTx' })
  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        relock: {
          lptoken: unipair.value,
          index: lock.value.user_lock_index,
          lockid: lock.value.lockid,
          unlock_date: unlockDate.value,
        },
      },
      defaultFee,
      undefined,
      [
        {
          amount: String(ethFee.value),
          denom: SETTINGS.CHAIN_UDENOM[reqNetwork.value],
        },
      ]
    )

    store.commit('closeDialog', { type: 'confirmTx' })
    resolveRef.value()
    dialog.value = false

    console.log('lock txhash: ', txhash)
  } catch (err) {
    console.log(err)
    store.commit('closeDialog', { type: 'confirmTx' })
    store.commit('openDialog', { type: 'web3Error', message: err.message })
  }

  withdrawLoading.value = false
}

const resolveRef = ref(null)
const rejectRef = ref(null)

getFees()
</script>
