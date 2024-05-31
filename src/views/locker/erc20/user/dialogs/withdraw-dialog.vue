<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Withdraw Tokens
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div  class="pa-1">

          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                <div v-if="false" class="textFaint--text font-italic">
                  Withdrawbale Shares: {{ withdrawableSharesHuman }}
                </div>
                <div class="textFaint--text">
                  Withdrawable: {{ withdrawableTokensHuman }}
                </div>
              </div>
              <div class="d-flex align-center">
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
                </c-input>
                <span class="mr-2">
                  {{ tokenHydrated.symbol }}
                </span>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>

        </div>

        <!--
        <div>
          {{ amount }}
        </div>
        -->

      </v-card-text>

      <!--
      <div>
        {{ shareAmount }}
      </div>
      <div>
        You get: {{ realWithdrawlAmountHuman }}
      </div>
      -->

      <v-row dense class="ma-2">
        <v-btn x-large rounded block @click="withdraw" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Withdraw
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CInput from '@/components/ui/input';
import Utils from '@/web3/utils';
import SETTINGS from '@/store/settings';

const dialog = ref(false);
const amount = ref('0');
const amountHuman = ref('0');
const withdrawLoading = ref(false);
const lock = ref({});
const tokenHydrated = ref({ decimals: '0' });
const wdrwShares = ref('0');
const wdrwTokens = ref('0');

const open = (lockData, tokenData) => {
  tokenHydrated.value = tokenData;
  lock.value = lockData;
  wdrwShares.value = '0';
  wdrwTokens.value = '0';
  refresh();
  dialog.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
};

const setMax = () => {
  amount.value = wdrwTokens.value;
  amountHuman.value = Utils.convertMicroDenomToDenom(amount.value, tokenHydrated.value.decimals);
};

const cancel = () => {
  rejectPromise();
  dialog.value = false;
};

const onHumanAmountChange = (val) => {
  amount.value = Utils.convertDenomToMicroDenom(val, tokenHydrated.value.decimals);
};

const getWithdrawableShares = async () => {
  const msg = {
    "get_withdrawable_shares": {
      "lockid": lock.value.lock_id,
    },
  };
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  wdrwShares.value = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg);
};

const getWithdrawableTokens = async () => {
  const msg = {
    "get_withdrawable_tokens": {
      "lockid": lock.value.lock_id,
    },
  };
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  wdrwTokens.value = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg);
};

const refresh = async () => {
  await getWithdrawableShares();
  await getWithdrawableTokens();
};

const withdraw = async () => {
  withdrawLoading.value = true;
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee;
  $root.$dialog.confirmTx.open();

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        "withdraw": {
          "lockid": lock.value.lock_id,
          "amount": amount.value
        }
      },
      defaultFee,
      undefined,
      []
    );

    $root.$dialog.confirmTx.close();

    resolvePromise();
    dialog.value = false;

    console.log("lock txhash: ", txhash);
  } catch (err) {
    console.log(err);
    $root.$dialog.confirmTx.close();
    $root.$dialog.web3Error.open(err.message);
  }

  withdrawLoading.value = false;
};

onMounted(() => {
  // Any initialization logic can go here
});

</script>
