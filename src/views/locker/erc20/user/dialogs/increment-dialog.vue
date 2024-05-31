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
          <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
            <div class="caption text-end mr-3 pt-2">
              Balance: {{ tokenBalanceHuman }}
            </div>
            <div class="d-flex align-center">
              <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
              </c-input>
              {{ tokenHydrated.symbol }}
              <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                MAX
              </v-btn>
            </div>
          </div>
        </div>

        <div class="text-center mt-3">
          Fee: {{ `${feeAmountHuman} ${reqNetwork}`}}
        </div>

        <div v-if="lock.owner !== sClient.address" class="caption orange--text text-center">
          CAUTION: You are not this lock's owner. You will be increasing the value of someone else's lock.
          <div class="textFaint--text font-italic">
            Lock Owner:
          </div>
          <div class="textFaint--text font-italic">
            {{ lock.owner }}
          </div>
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

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import CInput from '@/components/ui/input';
import SETTINGS from '@/store/settings';
import Utils from '@/web3/utils';

export default {
  components: {
    CInput
  },
  setup() {
    const dialog = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const balance = ref('0');
    const allowance = ref('0');
    const amount = ref('0');
    const amountHuman = ref('0');
    const loading = ref(false);
    const withdrawLoading = ref(false);
    const approvalLoading = ref(false);
    const lock = ref({});
    const fees = ref({
      token_fee: '0',
      free_locking_fee: '0',
      free_locking_token: ''
    });
    const tokenHydrated = ref({
      decimals: '0'
    });

    const store = useStore();

    const sClient = computed(() => store.state.signer);
    const reqNetwork = computed(() => store.state.requiredNetwork);

    const feeAmountHuman = computed(() => {
      const amount = Utils.convertMicroDenomToDenom(fees.value.mfee, 6);
      return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
    });

    const tokenBalanceHuman = computed(() => {
      const amount = Utils.convertMicroDenomToDenom(balance.value, tokenHydrated.value.decimals);
      return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 9 });
    });

    const allowanceIncreaseRequired = computed(() => {
      return Number(amount.value) > Number(allowance.value);
    });

    const open = (_lock, _tokenHydrated) => {
      lock.value = _lock;
      tokenHydrated.value = _tokenHydrated;
      dialog.value = true;
      getTokenBalance();
      getAllowance();
      return new Promise((res, rej) => {
        resolve.value = res;
        reject.value = rej;
      });
    };

    const setMax = () => {
      amount.value = balance.value;
      amountHuman.value = Utils.convertMicroDenomToDenom(balance.value, tokenHydrated.value.decimals);
    };

    const cancel = () => {
      dialog.value = false;
    };

    const getTokenBalance = async () => {
      if (!sClient.value.address || !tokenHydrated.value.address) {
        return;
      }
      const balanceQuery = {
        balance: { address: sClient.value.address }
      };
      const balanceResult = await sClient.value.client.queryContractSmart(tokenHydrated.value.address, balanceQuery);
      balance.value = balanceResult.balance;
    };

    const getAllowance = async () => {
      if (!sClient.value.address || !tokenHydrated.value.address) {
        return;
      }
      const allowanceQuery = { allowance: { owner: sClient.value.address, spender: SETTINGS.CHAINS[reqNetwork.value].tokenLocker } };
      const allowanceInfo = await sClient.value.client.queryContractSmart(tokenHydrated.value.address, allowanceQuery);
      allowance.value = allowanceInfo.allowance;
    };

    const onHumanAmountChange = (val) => {
      amount.value = Utils.convertDenomToMicroDenom(val, tokenHydrated.value.decimals);
    };

    const approve = async () => {
      const amount = '340282366920938463463374607431768211455';
      approvalLoading.value = true;

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
      const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee;

      store.root.$dialog.confirmTx.open();

      try {
        const txhash = await sClient.value.signedClient.execute(
          sClient.value.address,
          tokenHydrated.value.address,
          {
            "increase_allowance": {
              "spender": CONTRACT_ADDRESS,
              "amount": amount.toString(),
            }
          },
          defaultFee,
          undefined,
          []
        );

        getAllowance();
        store.root.$dialog.confirmTx.close();
      } catch (err) {
        store.root.$dialog.confirmTx.close();
        store.root.$dialog.web3Error.open(err.message);
      }

      approvalLoading.value = false;
    };

    const incrementLock = async () => {
      withdrawLoading.value = true;
      const lockAmount = parseInt(amount.value);

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
      const defaultFee = {
        amount: [],
        gas: "500000",
      };

      store.root.$dialog.confirmTx.open();

      try {
        const txhash = await sClient.value.signedClient.execute(
          sClient.value.address,
          CONTRACT_ADDRESS,
          {
            "increment_lock": {
              "amount": lockAmount.toString(),
              "lockid": lock.value.lock_id,
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

        store.root.$dialog.confirmTx.close();
        dialog.value = false;
      } catch (err) {
        store.root.$dialog.confirmTx.close();
        store.root.$dialog.web3Error.open(err.message);
      }

      withdrawLoading.value = false;
    };

    const getFees = async () => {
      const feeData = { "fee": 750000, "mfee": 250000 };
      fees.value = feeData;
    };

    onMounted(() => {
      getFees()
        .then(() => {
          loading.value = false;
        });
    });

    return {
      dialog,
      resolve,
      reject,
      balance,
      allowance,
      amount,
      amountHuman,
      loading,
      withdrawLoading,
      approvalLoading,
      lock,
      fees,
      tokenHydrated,
      sClient,
      reqNetwork,
      feeAmountHuman,
      tokenBalanceHuman,
      allowanceIncreaseRequired,
      open,
      setMax,
      cancel,
      getTokenBalance,
      getAllowance,
      onHumanAmountChange,
      approve,
      incrementLock
    };
  }
};
</script>
