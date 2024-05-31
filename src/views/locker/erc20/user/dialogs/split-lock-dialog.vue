<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Split Lock
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="caption mb-2">
          Split this lock into another lock with specified amount and the same unlock date. Useful if you have one large lock that's about to become withdrawable 
          and you'd like to split out say 10% and withdraw for marketing or some other use case
          and relock the remaining 90%.
        </div>

        <div>
          Amount to split to a new lock
        </div>

        <div  class="pa-1">

          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                Amount: {{ withdrawableBalanceHuman }}
              </div>
              <div class="d-flex align-center">
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
                </c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>

        </div>

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block depressed @click="splitLock" color="primary" class="white--text grad-green" :loading="splitLoading">
          Create new lock
          <v-icon class="ml-2">mdi-lock-outline</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import CInput from '@/components/ui/input';
import TxWrapper from '@/smart-contracts/tx-wrapper';
import VestingContract from '@/smart-contracts/token-locker/token-locker-contract';

const dialog = ref(false);
const resolvePromise = ref(null);
const rejectPromise = ref(null);
const amount = ref('0');
const amountHuman = ref('0');
const splitLoading = ref(false);
const lock = ref({
  amount_deposited: '0',
  tokens_deposited: '0',
  tokens_withdrawn: '0',
});
const tokenHydrated = ref({
  decimals: '0'
});

const sEthers = () => {
  return $store.state.ethers;
};

const amountRemaining = () => {
  return ethers.BigNumber.from(lock.value.tokens_deposited).sub(lock.value.tokens_withdrawn).toString();
};

const withdrawableBalanceHuman = () => {
  var amount = ethers.utils.formatUnits(amountRemaining.value, tokenHydrated.value.decimals);
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: tokenHydrated.value.decimals});
};

const open = (lockData, _tokenHydrated) => {
  lock.value = lockData;
  tokenHydrated.value = _tokenHydrated;
  dialog.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve;
    rejectPromise.value = reject;
  });
};

const setMax = () => {
  amount.value = lock.value.amount;
  amountHuman.value = ethers.utils.formatUnits(lock.value.amount, tokenHydrated.value.decimals);
};

const cancel = () => {
  rejectPromise.value();
  dialog.value = false;
};

const onHumanAmountChange = (val) => {
  amount.value = ethers.utils.parseUnits(val, tokenHydrated.value.decimals);
};

const splitLock = () => {
  splitLoading.value = true;
  TxWrapper.doTransaction(VestingContract.splitLock(lock.value.lock_id, amount.value), $root.$dialog.confirmTx)
    .then(() => {
      resolvePromise.value();
      dialog.value = false;
    })
    .catch(e => { $root.$dialog.web3Error.open(e.message); })
    .then(() => {
      splitLoading.value = false;
    });
};

</script>
