<template>
  <div>
    <v-icon size="180" style="color: #000; position: absolute; right: 50%; margin-right: -300px; margin-top: -80px;">mdi-lock-outline</v-icon>
    <div style="position: relative;">
      <div v-if="firstLoad" class="text-center">
        <v-progress-circular indeterminate size="150" color="textFaint">
          <v-icon size="100" color="textFaint">mdi-lock-outline</v-icon>
        </v-progress-circular>
      </div>
      <v-scroll-x-transition>
        <div>
          <div class="display-1 textFaint--text text-center font-weight-bold mb-8" style="font-size: 36px;color:#888">
            Lock Liquidity
          </div>
          <div v-if="false" class="caption">
            {{ feeInfo }}
          </div>
          <div class="mt-8 mb-2 title font-weight-bold text-center" style="font-size: 22px;">
            Lock how many LP tokens?
          </div>
          <div class="pa-4 align-center flex-nowrap inputcolor r-outlined" style="background-color: #223; font-size: small;">
            <div class="caption text-end">
              Balance: {{ uniBalanceHuman }}
            </div>
            <div class="d-flex align-center">
              <!-- <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 font-weight-bold"></c-input> -->
              <v-text-field v-model="amountHuman" variant="underlined" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 font-weight-bold pt-0"></v-text-field>
              <div class="font-weight-bold">LP</div>
              <v-btn small depressed color="primary" @click="setMax" class="ml-2" style="z-index: 100;">
                MAX
              </v-btn>
            </div>
            <div>
              <v-btn small outlined rounded color="" @click="setPercent(25)" class="mr-1" style="z-index: 100;">
                25%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setPercent(50)" class="mr-1" style="z-index: 100;">
                50%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setPercent(75)" class="mr-1" style="z-index: 100;">
                75%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setMax" class="mr-1" style="z-index: 100;">
                100%
              </v-btn>
            </div>
          </div>
          <div class="mt-8 mb-2 title font-weight-bold text-center" style="font-size: 24px;">
            Unlock Date
          </div>
          <div class="d-flex align-start inputcolor r-outlined pa-4" style="background-color: #223;">
            <div>
              <div class="font-weight-bold">{{ unlockDateHuman }}</div>
              <div class="">{{ unlockDateFromNow }}</div>
            </div>
            <v-spacer></v-spacer>
            <c-date @setDate="setUnlockDate"></c-date>
          </div>
          <div class="mt-8 mb-2 title font-weight-bold text-center">
            Who can withdraw the tokens?
          </div>
          <div class="text-center">
            <v-btn depressed :color="unlockerIsMe ? 'primary' : ''" @click="unlockerIsMe = true">
              Me
            </v-btn>
            <v-btn depressed :color="!unlockerIsMe ? 'primary' : ''" @click="unlockerIsMe = false">
              Someone else
            </v-btn>
          </div>
          <v-slide-y-transition>
            <div v-if="!unlockerIsMe" class="mt-2 d-flex align-center pa-3 r-outlined br-8 inputcolor">
              <v-text-field v-model="unlockerAccount" placeholder="Unlocker address" type="input"></v-text-field>
            </div>
          </v-slide-y-transition>
          <!-- <template> -->
            <div class="mt-8 mb-2 title font-weight-bold text-center">
              Fee
            </div>
            <v-item-group v-model:value="optionEthFee" mandatory>
              <v-container>
                <v-row dense class="justify-center" 
                >
                  <v-col cols="6">
                    <v-item v-slot="{ active, toggle }">
                      <v-card :color="active ? '#0000ff' : '#9c81bc'" :class="['d-flex align-center']" height="100" @click="toggle">
                        <div :class="['title flex-grow-1 text-center', {'white--text': active}]">
                          {{ ethFeeHuman }}
                          {{ $store.state.nativeGasTokenSymbol }}
                        </div>
                      </v-card>
                    </v-item>
                    <div class="caption textFaint--text text-center" style="font-size: smaller; margin-top: 8px;">
                      Your balance: {{ ethBalanceHuman }} {{ $store.state.nativeGasTokenSymbol }}
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-item-group>
          <!-- </template> -->
          <div class="mt-4 text-center">
            Once tokens are locked they cannot be withdrawn under any circumstances until the timer has expired. Please ensure the parameters are correct, as they are final.
          </div>
          <v-row dense class="ma-0 mt-4">
            <v-col cols="6">
              <v-btn @click="approve" color="#eee" x-large block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading">
                Approve
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="lockTokens" color="#eee" x-large block depressed :disabled="allowanceIncreaseRequired || amount === '0' || !userHasSufficientFlatrateToken" :loading="lockLoading">
                Lock
              </v-btn>
            </v-col>
          </v-row>

            <div v-if="!userHasSufficientFlatrateToken" class="d-flex align-center font-weight-medium midground pa-4 br-8 mt-2 mb-16" style="">
              <!-- <div class="red" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;"></div> -->
              <img :src="require('@/assets/img/flags/close.svg')" height="26px" class="mr-2" width="26px">
              <div>
                <div class="caption" style="position:relative">
                  You do not have enough {{ $store.state.nativeGasTokenSymbol }} in your wallet to perform this transaction.
                  {{ ethFeeHuman }}
                  {{ $store.state.nativeGasTokenSymbol }} required.
                </div>
              </div>
            </div>
        </div>
      </v-scroll-x-transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'
import CDate from '@/components/ui/date-picker'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

const props = defineProps({
  uniPair: String
})

const store = useStore()
const sClient = computed(() => store.state.signer)
const reqNetwork = computed(() => store.state.requiredNetwork)
const sClientWatcher = computed(() => sClient.value.watcher)

const balance = ref('0')
const decimals = ref('6')
const secondaryFeeBalance = ref('0')
const ethBalance = ref('0')
const amount = ref('0')
const amountHuman = ref('0')
const unlockDate = ref(moment().add(6, 'M').unix())
const allowance = ref('0')
const secondaryAllowance = ref('0')
const unlockerAccount = ref('')
const approvalLoading = ref(false)
const lockLoading = ref(false)
const firstLoad = ref(true)
const optionEthFee = ref(0)
const unlockerIsMe = ref(true)
const referrerBalanceMet = ref(false)
const whitelisted = ref(false)
const feeInfo = ref({})

const secondaryFeeHuman = computed(() => 0)

const ethFee = computed(() => {
  const months = parseInt((unlockDate.value - moment.now() / 1000) / 2628000 + 1)
  const totalFee = feeInfo.value.fee + feeInfo.value.mfee * months
  return totalFee
})

const ethFeeHuman = computed(() => {
  const months = parseInt((unlockDate.value - moment.now() / 1000) / 2628000 + 1)
  const totalFee = feeInfo.value.fee + feeInfo.value.mfee * months
  const amount = Utils.convertMicroDenomToDenom(totalFee, decimals.value)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})

const liquidityFee = computed(() => feeInfo.value.liquidity_fee / 10)

const liquidityFeeSecondary = computed(() => (feeInfo.value.liquidity_fee / 10) * ((1000 - feeInfo.value.secondary_token_discount) / 1000))

const uniBalanceHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(balance.value, decimals.value)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 5 })
})

const secondaryFeeBalanceHuman = computed(() => 0)

const ethBalanceHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(ethBalance.value, SETTINGS.CHAIN_DECIMALS[reqNetwork.value])
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})

const unlockDateHuman = computed(() => moment.unix(unlockDate.value).format('ddd D MMM YYYY HH:mm'))

const unlockDateFromNow = computed(() => moment.unix(unlockDate.value).fromNow())

const userHasSufficientFlatrateToken = computed(() => {
  const months = parseInt((unlockDate.value - moment.now() / 1000) / 2628000)
  return ethBalance.value > feeInfo.value.fee + feeInfo.value.mfee * months
})

const allowanceIncreaseRequired = computed(() => Number(amount.value) > Number(allowance.value))

const secondaryAllowanceIncreaseRequired = computed(() => true)

const getUniBalance = async () => {
  const balanceQuery = { balance: { address: sClient.value.address } }
  const balanceResult = await sClient.value.client.queryContractSmart(props.uniPair, balanceQuery)
  balance.value = balanceResult.balance
}

const getUniDecimals = async () => {
  const tokenInfoQuery = { token_info: {} }
  const tokenInfo = await sClient.value.client.queryContractSmart(props.uniPair, tokenInfoQuery)
  decimals.value = tokenInfo.decimals
}

const getSecondaryFeeBalance = async () => {
}

const getEthBalance = async () => {
  if (!sClient.value.address) return
  const ethBalanceResult = await sClient.value.client.getBalance(sClient.value.address, sClient.value.denom)
  ethBalance.value = ethBalanceResult.amount
}

const getAllowance = async () => {
  const allowanceQuery = { allowance: { owner: sClient.value.address, spender: SETTINGS.CHAINS[reqNetwork.value].lpLocker } }
  const allowanceInfo = await sClient.value.client.queryContractSmart(props.uniPair, allowanceQuery)
  allowance.value = allowanceInfo.allowance
}

const onHumanAmountChange = val => {
  amount.value = Utils.convertDenomToMicroDenom(val, decimals.value)
}

const setMax = () => {
  console.log('------------>btn event')
  amount.value = balance.value
  amountHuman.value = Utils.convertMicroDenomToDenom(balance.value, decimals.value)
}

const setPercent = percent => {
  amount.value = balance.value * percent / 100
  amountHuman.value = Utils.convertMicroDenomToDenom(amount.value, decimals.value)
}

const setUnlockDate = date => {
  unlockDate.value = date.unix()
}

const approve = async () => {
  console.log('===============>approve test')
  const amountToApprove = '340282366920938463463374607431768211455'
  approvalLoading.value = true

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee

  store.root.$dialog.confirmTx.open()

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      props.uniPair,
      {
        "increase_allowance": {
          "spender": CONTRACT_ADDRESS,
          "amount": amountToApprove,
        }
      },
      defaultFee,
      undefined,
      []
    )
    getAllowance()
    store.root.$dialog.confirmTx.close()
  } catch (err) {
    store.root.$dialog.confirmTx.close()
    store.root.$dialog.web3Error.open(err.message)
  }

  approvalLoading.value = false
}

const approveSecondary = () => {
}

const getFees = async () => {
  const feeInfoResult = { "fee": 750000, "mfee": 250000 }
  feeInfo.value = feeInfoResult
}

const getUserWhitelistStatus = async () => {
}

const lockTokens = async () => {
  lockLoading.value = true
  const amountToLock = parseInt(amount.value)
  const unlocker = unlockerIsMe.value ? sClient.value.address : unlockerAccount.value

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  const defaultFee = { amount: [], gas: "500000" }

  store.root.$dialog.confirmTx.open()

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        "lock_l_p_token": {
          "lptoken": props.uniPair,
          "amount": amountToLock.toString(),
          "unlock_date": Number(unlockDate.value),
          "withdrawer": unlocker
        }
      },
      defaultFee,
      undefined,
      [
        {
          amount: String(ethFee.value),
          denom: SETTINGS.CHAIN_UDENOM[reqNetwork.value]
        }
      ]
    )

    store.root.$dialog.confirmTx.close()
    store.emit('on-lock', amountToLock)
  } catch (err) {
    store.root.$dialog.confirmTx.close()
    store.root.$dialog.web3Error.open(err.message)
  }

  lockLoading.value = false
}

const doFirstLoad = async () => {
  await getFees()
  await getUniBalance()
  await getAllowance()
  await getUserWhitelistStatus()
  getSecondaryFeeBalance()
  getEthBalance()
}

onMounted(() => {
  doFirstLoad()
    .then(() => {})
    .catch(e => {})
    .then(() => {
      firstLoad.value = false
    })
})
</script>
