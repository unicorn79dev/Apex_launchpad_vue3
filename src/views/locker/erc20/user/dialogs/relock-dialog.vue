<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Relock Tokens
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">
          Current lock date
        </div>

        <div>
          {{ currentLockDateHuman }}
        </div>

        <div class="mt-10">
          New Unlock Date
        </div>

        <div class="d-flex align-center inputcolor r-outlined pa-4">
          <div>
            <div class="font-weight-bold">
              {{ unlockDateHuman }}
            </div>
            <div class="textFaint--text caption">
              {{ unlockDateFromNow }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <c-date @setDate="setUnlockDate"></c-date>
        </div>

        <div v-if="lockDateInvalid" class="text-center caption orange--text">
          Lock date needs to be after current lock date
        </div>

        <div v-if="!tokenOnFeeWhitelist" class="text-center mt-3">
          Fee: {{ `${feeAmountHuman} ${reqNetwork}`}}
        </div>

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
import { ref } from 'vue';
import moment from 'moment';
import Utils from '@/web3/utils';
import SETTINGS from '@/store/settings';

const dialog = ref(false);
const resolvePromise = ref(null);
const rejectPromise = ref(null);
const unlockDate = ref('0');
const amount = ref('0');
const amountHuman = ref('0');
const loading = ref(true);
const withdrawLoading = ref(false);
const lock = ref({});
const fees = ref({
  fee: '0',
  mfee: '0',
});
const tokenOnFeeWhitelist = ref(false);

const sClient = () => {
  return $store.state.signer;
};

const reqNetwork = () => {
  return $store.state.requiredNetwork;
};

const feeAmountHuman = () => {
  var amount = Utils.convertMicroDenomToDenom(fees.value.mfee, 6);
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4});
};

const withdrawableBalanceHuman = () => {
  var amount = Utils.convertMicroDenomToDenom(lock.value.amount, 6);
  return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4});
};

const currentLockDateHuman = () => {
  return moment.unix(lock.value.end_emission).format('ddd D MMM YYYY HH:mm');
};

const unlockDateHuman = () => {
  return moment.unix(unlockDate.value).format('ddd D MMM YYYY HH:mm');
};

const unlockDateFromNow = () => {
  return moment.unix(unlockDate.value).fromNow();
};

const lockDateInvalid = () => {
  return Number(unlockDate.value) <= Number(lock.value.end_emission);
};

const open = (lockData) => {
  lock.value = lockData;
  unlockDate.value = lockData.end_emission;
  dialog.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve;
    rejectPromise.value = reject;
  });
};

const cancel = () => {
  rejectPromise.value();
  dialog.value = false;
};

const setUnlockDate = (date) => {
  unlockDate.value = date.unix();
};

const relock = async () => {
  withdrawLoading.value = true;
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee;

  $root.$dialog.confirmTx.open();
  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        "relock": {
          "lockid": lock.value.lock_id,
          "unlock_date": unlockDate.value
        }
      },
      defaultFee,
      undefined,
      [
        {
          amount: String(fees.value.mfee),
          denom: SETTINGS.CHAIN_UDENOM[reqNetwork.value]
        }
      ]
    );

    $root.$dialog.confirmTx.close();

    dialog.value = false;

    console.log("lock txhash: ", txhash);
  } catch (err) {
    console.log(err);
    $root.$dialog.confirmTx.close();
    $root.$dialog.web3Error.open(err.message);
  }

  withdrawLoading.value = false;
};

const getFees = async () => {
  var feesData = { fee: "750000", mfee: "250000"};
  fees.value = feesData;
};

getFees()
  .then(() => {})
  .catch(e => {})
  .then(() => {
    loading.value = false;
  });

</script>
