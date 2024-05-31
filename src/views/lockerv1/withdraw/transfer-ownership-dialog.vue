<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-card-text>
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">Transfer ownership</div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">Transfer this lock to a new owner</div>
        <div class="caption">
          The specified address will be able to withdraw the LP tokens once the unlock date is reached.
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <c-input v-model:value="unlockerAccount" placeholder="New owner address..."></c-input>
        </div>
      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn
          x-large
          block
          rounded
          depressed
          @click="transferLockOwnership"
          class="white--text grad-green"
          :loading="withdrawLoading"
        >
          Transfer
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import CInput from '@/components/ui/input'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

const props = defineProps({
  lock: Object,
  unipair: String
})

const dialog = ref(false)
const unlockerAccount = ref('')
const withdrawLoading = ref(false)

const store = useStore()

const sClient = computed(() => store.state.signer)
const reqNetwork = computed(() => store.state.requiredNetwork)

const withdrawableBalanceHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(props.lock.amount, 6)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})

const open = (lock, unipair) => {
  props.lock = lock
  props.unipair = unipair
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

const transferLockOwnership = async () => {
  withdrawLoading.value = true
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  store.commit('openDialog', { type: 'confirmTx' })
  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        transfer_lock_ownership: {
          lptoken: props.unipair,
          index: props.lock.user_lock_index,
          lockid: props.lock.lockid,
          new_owner: unlockerAccount.value
        }
      },
      defaultFee,
      undefined,
      []
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
</script>
