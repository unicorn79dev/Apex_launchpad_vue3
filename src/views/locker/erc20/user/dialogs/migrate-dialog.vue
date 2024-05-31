<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Migrate Liquidity
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <!-- {{ lock }}
        {{ unipair }} -->

        <div  class="pa-1">

          Migrateable: {{ withdrawableBalanceHuman }}

        </div>

        <!--
        <div>
          {{ amount }}
        </div>
        -->

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block depressed @click="migrate" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Migrate
          <v-icon class="ml-2">mdi-arrow-right</v-icon>
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
const lpTokenAddress = ref('');
const farmAddress = ref('');
const farmIndex = ref('');
const stakedBalance = ref('0');
const loading = ref(false);
const withdrawLoading = ref(false);
const lock = ref({
  amount_withdrawn: '0',
  tokens_deposited: '0',
  tokens_withdrawn: '0',
});
const tokenHydrated = ref({
  decimals: '0',
});

const sEthers = () => {
  return $store.state.ethers;
};

const amountRemaining = () => {
  return ethers.BigNumber.from(lock.value.tokens_deposited).sub(lock.value.tokens_withdrawn).toString();
};

const withdrawableBalanceHuman = () => {
  var amount = ethers.utils.formatUnits(amountRemaining(), tokenHydrated.value.decimals);
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: tokenHydrated.value.decimals});
};

const open = (lockData, tokenData) => {
  lock.value = lockData;
  tokenHydrated.value = tokenData;
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

const getStakedLPBalance = async () => {
  var stakedLPBalance = await VestingContract.userInfo(farmAddress.value, sEthers().coinbase);
  stakedBalance.value = stakedLPBalance.amountWithdrawable;
};

const onHumanAmountChange = (val) => {
  amount.value = ethers.utils.parseUnits(val, 18);
};

const migrate = () => {
  withdrawLoading.value = true;
  TxWrapper.doTransaction(VestingContract.migrate(lock.value.lock_id, 666), $root.$dialog.confirmTx)
    .then(() => {
      resolvePromise.value();
      dialog.value = false;
    })
    .catch(e => { $root.$dialog.web3Error.open(e.message) })
    .then(() => {
      withdrawLoading.value = false;
    });
};

</script>
