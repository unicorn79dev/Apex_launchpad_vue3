<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Revoke Condition
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="caption">
          Revoke this premature unlocking condition, this cannot be undone. Your tokens will then be withdrawable only by 
          the set end date.
        </div>

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block depressed @click="revoke" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Revoke Conditional Unlock
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ethers } from 'ethers';
import TxWrapper from '@/smart-contracts/tx-wrapper';
import VestingContract from '@/smart-contracts/token-locker/token-locker-contract';

const dialog = ref(false);
const resolvePromise = ref(null);
const rejectPromise = ref(null);
const amount = ref('0');
const amountHuman = ref('0');
const loading = ref(false);
const withdrawLoading = ref(false);
const lock = ref({
  amount: '0'
});
const tokenHydrated = ref({
  decimals: '0'
});

const sEthers = () => {
  return $store.state.ethers;
};

const withdrawableBalanceHuman = () => {
  var amount = ethers.utils.formatUnits(lock.value.amount_withdrawn, 18);
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4});
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
  amountHuman.value = ethers.utils.formatUnits(lock.value.amount, 18);
};

const cancel = () => {
  rejectPromise.value();
  dialog.value = false;
};

const onHumanAmountChange = (val) => {
  amount.value = ethers.utils.parseUnits(val, 18);
};

const revoke = () => {
  withdrawLoading.value = true;
  TxWrapper.doTransaction(VestingContract.revokeCondition(lock.value.lock_id), $root.$dialog.confirmTx)
    .then(() => {
      resolvePromise.value();
      dialog.value = false;
    })
    .catch(e => { $root.$dialog.web3Error.open(e.message); })
    .then(() => {
      withdrawLoading.value = false;
    });
};

</script>
