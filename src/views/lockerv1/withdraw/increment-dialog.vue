<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-card-text>
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Increase Lock
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="pa-1">
          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                Balance: {{ uniBalanceHuman }}
              </div>
              <div class="d-flex align-center">
                <!-- <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold"> -->
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
                </c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>
        </div>

        <div class="text-center mt-3">
          {{ `Fee: ${feeHuman} ${reqNetwork}`}}
        </div>
      </v-card-text>

      <v-row dense class="ma-2 mt-3">
        <v-col cols="6">
          <v-btn @click="approve" x-large block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading" class="white--text grad-green">
            Approve
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn @click="incrementLock" x-large block depressed :disabled="allowanceIncreaseRequired || amount === '0'" :loading="withdrawLoading" class="white--text grad-green">
            Lock
            <v-icon class="ml-2">mdi-arrow-up</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import CInput from '@/components/ui/input'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

const dialog = ref(false)
const resolve = ref(null)
const reject = ref(null)
const balance = ref('0')
const allowance = ref('0')
const amount = ref('0')
const amountHuman = ref('0')
const loading = ref(false)
const withdrawLoading = ref(false)
const approvalLoading = ref(false)
const lock = ref({})
const unipair = ref(null)
const feeInfo = ref({})

const store = useStore()

const sClient = computed(() => store.state.signer)
const reqNetwork = computed(() => store.state.requiredNetwork)

const uniBalanceHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(balance.value, decimals.value)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 5 })
})

const allowanceIncreaseRequired = computed(() => {
  return Number(amount.value) > Number(allowance.value)
})

const feeHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(feeInfo.value.mfee, decimals.value)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 5 })
})

const open = (lockVal, unipairVal) => {
  lock.value = lockVal
  unipair.value = unipairVal
  dialog.value = true
  getUniBalance()
  getAllowance()
  return new Promise((res, rej) => {
    resolve.value = res
    reject.value = rej
  })
}

const setMax = () => {
  amount.value = balance.value
  amountHuman.value = Utils.convertMicroDenomToDenom(balance.value, decimals.value)
}

const cancel = () => {
  reject.value()
  dialog.value = false
}

const getUniBalance = async () => {
  const balanceQuery = { balance: { address: sClient.value.address } }
  const balanceResult = await sClient.value.client.queryContractSmart(unipair.value, balanceQuery)
  balance.value = balanceResult.balance
}

const getAllowance = async () => {
  const allowanceQuery = { allowance: { owner: sClient.value.address, spender: SETTINGS.CHAINS[reqNetwork.value].lpLocker } }
  const allowanceInfo = await sClient.value.client.queryContractSmart(unipair.value, allowanceQuery)
  allowance.value = allowanceInfo.allowance
  console.log("Allowance = ", allowance.value)
}

const onHumanAmountChange = (val) => {
  amount.value = Utils.convertDenomToMicroDenom(val, decimals.value)
}

const approve = async () => {
  const amount = '340282366920938463463374607431768211455'
  approvalLoading.value = true

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  store.state.dialog.confirmTx.open()

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      unipair.value,
      {
        "increase_allowance": {
          "spender": CONTRACT_ADDRESS,
          "amount": amount.toString(),
        }
      },
      defaultFee,
      undefined,
      []
    )

    console.log("txhash", txhash)
    getAllowance()
    store.state.dialog.confirmTx.close()
  } catch (err) {
    console.log(err)
    store.state.dialog.confirmTx.close()
    store.state.dialog.web3Error.open(err.message)
  }

  approvalLoading.value = false
}

const incrementLock = async () => {
  withdrawLoading.value = true
  const amountVal = parseInt(amount.value)

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  store.state.dialog.confirmTx.open()

  console.log(sClient.value.signedClient)
  
  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        "increment_lock": {
          "lptoken": unipair.value,
          "index": lock.value.user_lock_index,
          "lockid": lock.value.lockid,
          "amount": amountVal.toString(),
        }
      },
      defaultFee,
      undefined,
      []
    )

    store.state.dialog.confirmTx.close()
    resolve.value()
    dialog.value = false
    console.log("lock txhash: ", txhash)
  } catch (err) {
    console.log(err)
    store.state.dialog.confirmTx.close()
    store.state.dialog.web3Error.open(err.message)
  }

  withdrawLoading.value = false
}

const getFees = async () => {
  const feeInfoResult = { "fee": 750000, "mfee": 250000 }
  feeInfo.value = feeInfoResult
}

onMounted(() => {
  getFees()
    .then(() => {})
    .catch(e => {})
    .then(() => {
      loading.value = false
    })
})
</script>
