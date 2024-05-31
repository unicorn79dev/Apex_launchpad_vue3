<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-card-text>
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">Split Lock</div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="caption mb-2">
          Split this lock into another lock with specified amount. Useful if you have one large lock that's about to become withdrawable and you'd like to split out say 10% and withdraw for marketing or some other use case and relock the remaining 90%.
        </div>

        <div>Amount to split to a new lock</div>

        <div class="pa-1">
          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">Amount: {{ withdrawableBalanceHuman }}</div>
              <div class="d-flex align-center">
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold"></c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">MAX</v-btn>
              </div>
            </div>
          </template>
        </div>

        <div class="text-center mt-2">Fee: {{ ethFeeHuman }} {{ $store.state.nativeGasTokenSymbol }}</div>
      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block depressed @click="splitLock" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Create new lock
          <v-icon class="ml-2">mdi-lock-outline</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { ethers } from 'ethers'
import CInput from '@/components/ui/input'
import TxWrapper from '@/smart-contracts/tx-wrapper'
import LockerContract from '@/smart-contracts/lock-uni-v2/univ2-contract'

const dialog = ref(false)
const amount = ref('0')
const amountHuman = ref('0')
const withdrawLoading = ref(false)
const lock = ref({ amount: '0' })
const unipair = ref({})
const feeInfo = ref({ eth_fee: '0' })

const store = useStore()

const sEthers = computed(() => store.state.ethers)

const withdrawableBalanceHuman = computed(() => {
  const amount = ethers.utils.formatUnits(lock.value.amount, 18)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})

const ethFeeHuman = computed(() => {
  const amount = ethers.utils.formatUnits(feeInfo.value.eth_fee, 18)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})

const open = (lockVal, unipairVal) => {
  lock.value = lockVal
  unipair.value = unipairVal
  dialog.value = true
  return new Promise((resolve, reject) => {
    resolveRef.value = resolve
    rejectRef.value = reject
  })
}

const setMax = () => {
  amount.value = lock.value.amount
  amountHuman.value = ethers.utils.formatUnits(lock.value.amount, 18)
}

const cancel = () => {
  rejectRef.value()
  dialog.value = false
}

const onHumanAmountChange = (val) => {
  amount.value = ethers.utils.parseUnits(val, 18)
}

const splitLock = async () => {
  withdrawLoading.value = true
  const ethFee = feeInfo.value.eth_fee
  try {
    await TxWrapper.doTransaction(LockerContract.splitLock(unipair.value.address, lock.value.user_lock_index, lock.value.lockID, amount.value, ethFee), store.commit('openDialog', { type: 'confirmTx' }))
    resolveRef.value()
    dialog.value = false
  } catch (e) {
    store.commit('openDialog', { type: 'web3Error', message: e.message })
  } finally {
    withdrawLoading.value = false
  }
}

const getFees = async () => {
  feeInfo.value = await LockerContract.getFees()
}

const resolveRef = ref(null)
const rejectRef = ref(null)

getFees()
</script>
