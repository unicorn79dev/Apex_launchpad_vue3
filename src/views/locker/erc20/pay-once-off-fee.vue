<template>
  <div>
    <div class="font-weight-bold">
      OPTIONAL: Enable free locking for {{ tokenHydrated.symbol }}!
    </div>
    <div class="mt-2 caption textFaint--text">
      Pay a once-off fee so that <strong>{{ tokenHydrated.symbol }}</strong> is whitelisted. From then onwards, you or anyone from your community can use the Vesting platform 
      to lock <strong>{{ tokenHydrated.symbol }}</strong> with no fees.
    </div>
    <div class="d-flex align-center">
      Your balance:
      <v-spacer></v-spacer>
      {{ feeBalanceHuman }} {{ freeLockingToken.symbol }}
      <coin-icon :address="feeTokenIcon" :url="feeTokenUrl" :size="26" class="ml-2"></coin-icon>
    </div>
    <div class="d-flex align-center">
      Fee:
      <v-spacer></v-spacer>
      {{ freeLockingFeeHuman }} {{ freeLockingToken.symbol }}
      <coin-icon :address="feeTokenIcon" :url="feeTokenUrl" :size="26" class="ml-2"></coin-icon>
    </div>

    <div v-if="eInsufficientBalanceForFee" class="d-flex align-center font-weight-medium background pa-4 br-8 mt-2" style="position: relative; overflow: hidden;">
      <img 
      :src="require('@/assets/img/flags/close.svg')" 
      height="26px"
      class="mr-2"
      width="26px">
      <div>
        <div class="caption">
          You do not have enough {{ freeLockingToken.symbol }} in your wallet to perform this transaction.
          {{ freeLockingFeeHuman }}
          {{ freeLockingToken.symbol }} required.
        </div>
      </div>
    </div>

    <v-row v-if="feeInGasToken" dense class="ma-0 mt-4">
      <v-btn @click="payFee" color="" outlined x-large block depressed :loading="payFeeLoading">
        Pay {{ freeLockingFeeHuman }} {{ freeLockingToken.symbol }} fee
      </v-btn>
    </v-row>
    <v-row v-else dense class="ma-0 mt-4">
      <v-col cols="6">
        <v-btn @click="approve" color="" outlined x-large block depressed :disabled="!allowanceIncreaseRequired || eInsufficientBalanceForFee" :loading="approvalLoading">
          Approve
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn @click="payFee" color="" outlined x-large block depressed :disabled="allowanceIncreaseRequired" :loading="payFeeLoading">
          Pay {{ freeLockingFeeHuman }} {{ freeLockingToken.symbol }} fee
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { ethers } from 'ethers'
import { useStore } from 'vuex'
import { ERC20, TxWrapper, VestingContract, VestingABI } from '@/smart-contracts'

const props = defineProps<{
  tokenHydrated: { symbol: string, name: string, decimals: string },
  fees: { free_locking_fee: string, free_locking_token: string }
}>()

const store = useStore()

const freeLockingToken = ref<any>({})
const allowance = ref<string>('0')
const balance = ref<string>('0')
const approvalLoading = ref<boolean>(false)
const payFeeLoading = ref<boolean>(false)

const sEthers = computed(() => store.state.ethers)
const sEthersWatcher = computed(() => sEthers.value.watcher)

const feeTokenIcon = computed(() => !feeInGasToken.value ? freeLockingToken.value.address : '')
const feeTokenUrl = computed(() => feeInGasToken.value ? store.state.settings.CHAINS[store.state.requiredNetwork].icon : null)
const freeLockingFeeHuman = computed(() => {
  const amount = ethers.utils.formatUnits(props.fees.free_locking_fee, 18)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})
const feeInGasToken = computed(() => props.fees.free_locking_token === ethers.constants.AddressZero)
const feeBalanceHuman = computed(() => {
  const amount = ethers.utils.formatUnits(balance.value, freeLockingToken.value.decimals)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })
})
const allowanceIncreaseRequired = computed(() => ethers.BigNumber.from(props.fees.free_locking_fee).gt(allowance.value))
const eInsufficientBalanceForFee = computed(() => ethers.BigNumber.from(balance.value).lt(props.fees.free_locking_fee))

const confirmTxdialog = inject('confirmTxdialog')
const rejectTxdialog = inject('rejectTxdialog')
const web3errDialog = inject('web3errDialog')

const payFee = async () => {
  payFeeLoading.value = true
  const msgValue = feeInGasToken.value ? props.fees.free_locking_fee : '0'
  try {
    await TxWrapper.doTransaction(VestingContract.payForFreeTokenLocks(props.tokenHydrated.address, msgValue))
    await getAllowance()
    await getFeeTokenBalance()
  } catch (e) {
    web3errDialog(e.message)
  } finally {
    payFeeLoading.value = false
  }
}

const approve = async () => {
  approvalLoading.value = true
  try {
    await TxWrapper.doTransaction(ERC20.setAllowance(props.fees.free_locking_token, props.fees.free_locking_fee, VestingABI.vesting_address()))
    await getAllowance()
  } catch (e) {
    web3errDialog(e.message)
  } finally {
    approvalLoading.value = false
  }
}

const getAllowance = async () => {
  if (props.fees.free_locking_token === ethers.constants.AddressZero) {
    return
  }
  const result = await ERC20.getAllowance(props.fees.free_locking_token, sEthers.value.coinbase, VestingABI.vesting_address())
  allowance.value = result
}

const getFeeTokenBalance = async () => {
  const result = feeInGasToken.value
    ? await sEthers.value.provider.getBalance(sEthers.value.coinbase)
    : await ERC20.getBalance(sEthers.value.coinbase, props.fees.free_locking_token)
  balance.value = result
}

const getFeeToken = async () => {
  freeLockingToken.value = feeInGasToken.value
    ? store.state.settings.CHAINS[store.state.requiredNetwork].gasToken
    : await ERC20.getERC20(props.fees.free_locking_token)
}

const refresh = async () => {
  await getAllowance()
  await getFeeTokenBalance()
  await getFeeToken()
}

watch(sEthersWatcher, refresh)
onMounted(refresh)
</script>
