<template>
  <v-container style="max-width: 600px; " :class="[{'pa-0 foreground mobile-page': isXs}, 'pt-16 mt-8']">
    <v-slide-x-transition appear>
      <div class="rounded-xl px-6 py-6" style="background-color: #0a0815;border:1px solid #5a5865;">
        
        <div class="text-center">
          <img 
            :src="require('@/assets/img/icons/padlock.svg')" 
            height="60px"
            width="60px"
            class="greyscale"
            >
        </div>

        <div class="title text-center textFaint--text mb-4">
          CW20 Token Locker
        </div>

        <div class="text-caption">
          CW20 Token locks in our token vesting locking pools are represented as shares of a pool, in a similar way to a dex pool, allowing support for all CW20 tokens including rebasing and deflationary mechanisms.
        </div>

        <div class="text-caption text-disabled font-italic textFaint--text mb-4">
          This means lock amounts may change due to decimal rounding, but you will always retain your share of the pool.
        </div>

        <div class="text-caption font-italic orange--text mb-4" style="color: #ff9800;">
          Do not lock Liquidity tokens here, they will <strong>not</strong> be shown in the Apexpad browser.
        </div>

        <div class="text-center py-2 mb-5">
          <div class="textFaint--text text-disabled">
            Selected network
          </div>
          <!-- <v-btn large block outlined @click="$root.$dialog.chainSwitcher.open()" class="title"> -->
          <v-btn large block outlined @click="openChainSwitcher" class="title border" style="font-size: larger;">
            <img 
            :src="$settings.CHAINS[$store.state.requiredNetwork].icon" 
            height="24px"
            width="24px"
            class="mr-3 br-20">
            {{ $settings.CHAIN_DISPLAY_NAME[$store.state.requiredNetwork] }}
            <v-icon small color="">mdi-chevron-down</v-icon>
          </v-btn>
        </div>

        <v-btn v-if="!sClient.address" @click="connectWallet" 
        large block outlined class="title border"  style="font-size: larger;">
          <v-icon class="mr-3">mdi-wallet</v-icon>
          Connect your wallet
        </v-btn>
        <!-- <v-btn v-if="!sClient.address" to="/connect-wallet" 
        large block outlined class="title">
          <v-icon class="mr-3">mdi-wallet</v-icon>
          Connect your wallet
        </v-btn> -->

        <template v-else>

          <div :class="['mt-1 mb-2 d-flex align-center pa-3 r-outlined br-20 mx-2', {'foreground': isXs}, {'inputcolor': !isXs}]">
            <img 
            :src="$settings.CHAINS[$store.state.requiredNetwork].icon" 
            height="20px"
            width="20px"
            class="mr-2 br-20">
            <!-- <c-input :value.sync="tokenAddress" placeholder="Token address..." class=""> -->
            <v-text-field v-model="tokenAddress" placeholder="Token address..." class="">
            </v-text-field>

            <v-progress-circular
            v-if="showSearchLoader"
            indeterminate
            width="2"
            class="mr-2"
            size="24"
            color="primary"
            ></v-progress-circular>

            <v-icon v-if="tokenAddress === ''">
              mdi-magnify
            </v-icon>
            <v-icon v-else @click="tokenAddress = ''">
              mdi-close
            </v-icon>

          </div>

          <div v-show="tokenHydrated.address">

            <v-card outlined class="v-card pa-4 br-20 green-button white--text">
              <div class="d-flex align-center white--text">
                <coin-icon :address="'addr'" class="mr-2"></coin-icon>
                {{ tokenHydrated.symbol }} 
                <span class="white--text ml-1">/ {{ tokenHydrated.name }}</span>
                <v-spacer></v-spacer>
                <div class="caption white--text">
                  {{ tokenHydrated.decimals }} decimals
                </div>
              </div>
              <div class="text-center">
                <div class="caption white--text font-italic mt-2">
                  Your balance
                </div>
                <div class="title">
                  {{ tokenBalanceHuman }} {{ tokenHydrated.symbol }} 
                </div>
                <v-spacer></v-spacer>
              </div>
            </v-card>

            <div class="mt-2 d-flex align-center mx-auto" style="max-width: 580px;flex: 1 1 0;">

              <div :class="['top-tab', {'active': tab === 0}]" @click="tab = 0">
                <v-icon size="20" class="mr-1">mdi-lock-outline</v-icon>
                <span>New lock</span>
              </div>

              <div :class="['top-tab', {'active': tab === 1}]" @click="tab = 1">
                <v-icon size="20" class="mr-1">mdi-lock</v-icon>
                <span>View locks</span>
              </div>

            </div>

            <!-- LOCK TAB -->
            <div v-show="tab == 0">
              <!-- LOCK ARRAY -->
              <div class="mt-5 border-sm br-20">
                <div class="pa-4 border-b">
                  Locks 
                  <span class="textFaint--text">({{ locks.length }})</span>
                </div>
                <lock-row 
                v-for="lock of locks" 
                :key="lock.nonce"
                :lock="lock"
                :tokenHydrated="tokenHydrated"
                :balance="balance"
                @remove-lock="removeLock(lock.nonce)"
                @duplicate="duplicate(lock)">
                </lock-row>

                <div class="background border-b text-center py-2">
                  <v-btn small color="primary" @click="addLock">
                    <v-icon small>mdi-subdirectory-arrow-right</v-icon>
                    Add A lock
                  </v-btn>
                </div>

                <div class="background text-center caption text--text px-2 py-2">
                  <span class="font-weight-bold text--text">{{ totalLockAmountHuman }}</span>
                  /{{ tokenBalanceHuman }} <span class="font-weight-bold text--text">{{ tokenHydrated.symbol }}</span> 
                  total locked
                </div>

              </div>
              <!-- LOCK ARRAY -->

              <div>
                <div v-if="tokenOnFeeWhitelist" class="pa-8 br-20 text-center">
                  <v-icon size="60" color="textFaint">mdi-emoticon-excited-outline</v-icon>
                  <div class="textFaint--text">
                    No fees for this token!
                  </div>
                </div>

                <div v-else outlined class="pa-6 border-sm br-8 mt-4">
    
                  <div class="d-flex">
                    Fee: 
                    <v-spacer></v-spacer>
                    {{ `${feeAmountHuman} ${reqNetwork}` }}
                  </div>
                  <div class="d-flex">
                    Total Debit: 
                    <v-spacer></v-spacer>
                    <span :class="[{'orange--text': errorInsufficientBalanceForLocks}]">{{ totalDebitAmountHuman }} {{ tokenHydrated.symbol }}</span>
                  </div>

                </div>
              </div>

              <div class="my-3 textFaint--text caption font-italic text-center" style="font-size: 12px; color:#bbb">
                Once tokens are locked they cannot be withdrawn under any circumstances until the timer has expired. Please ensure the parameters are correct, as they are final.
              </div>

              <div v-if="errorTotalLockAmountIsZero" class="text-center orange--text py-2" style="color:orange">
                Total Lock amount is Zero
              </div>

              <div v-if="errorInsufficientBalanceForLocks" class="d-flex align-center font-weight-medium midground pa-4 br-8 mt-2" style="position: relative; overflow: hidden;">
                <div class="red" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;">
                </div>
                <img 
                :src="require('@/assets/img/flags/close.svg')" 
                height="26px"
                class="mr-2"
                width="26px">
                <div>
                  <div class="caption">
                    You do not have enough {{ tokenHydrated.symbol }} for this transaction.
                    {{ totalDebitAmountHuman }}
                    {{ tokenHydrated.symbol }} required.
                  </div>
                </div>
              </div>

              <v-row dense class="ma-0 mt-4">
                <v-col cols="6">
                  <v-btn @click="approve" color="#9c81bc" size="x-large" block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading">
                    Approve
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn @click="lockTokens" color="#9c81bc" size="x-large" block depressed :disabled="allowanceIncreaseRequired" :loading="lockLoading">
                    Lock
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <div v-show="tokenHydrated.address && sClient.address && tab === 1" :class="[{'v-card br-20 mt-4': isXs}, {'v-card br-20 mt-4': !isXs}]">
              <global-token :tokenHydrated="tokenHydrated" :isForUser="true"></global-token>
            </div>
            <div style="margin-bottom: 80px;"></div>

          </div>

        </template>

      </div>
    </v-slide-x-transition>

  </v-container>
</template>

<script setup>
import GlobalToken from './global-token/Main';
import LockRow from './lock-tokens/lock-row';
import moment from 'moment';
import Utils from '@/web3/utils';
import SETTINGS from '@/store/settings';
import { ref, computed, watch, inject, provide } from 'vue';
import { useDisplay } from 'vuetify';
import store from '@/store';
import { useRouter } from 'vue-router';

import coinIcon from '@/components/ui/coin-icon.vue';
const root = inject('app');

const chainSwitcher = inject('chainswitcher');
const connectwallet = inject('connectwallet');

const router = useRouter();

const count=ref(false)
provide('message', count)


const { xs } = useDisplay();
const isXs = computed(() => xs.value);

const tab = ref(0);
const allowance = ref('0');
const balance = ref('0');
const tokenAddress = ref('');
const showSearchLoader = ref(false);
const tokenHydrated = ref({});
const approvalLoading = ref(false);
const lockLoading = ref(false);
const locks = ref([]);
const addNonce = ref(-1);
const fees = ref({
  fee: '0',
  mfee: '0',
});
const tokenOnFeeWhitelist = ref(false);
const chargeFeeSeperately = ref(true);
const fa = inject('formatAmount');
const sClient = computed(() => store.state.signer);
const reqNetwork = computed(() => store.state.requiredNetwork);
const tokenBalanceHuman = computed(() => {
  // return root.formatAmount(balance.value, tokenHydrated.value.decimals);
  return fa(balance.value, tokenHydrated.value.decimals);
});
const allowanceIncreaseRequired = computed(() => {
  return Number(totalLockAmount.value) > Number(allowance.value);
});
const totalLockAmount = computed(() => {
  return locks.value.reduce((a, b) => Number(a) + Number(b.amount), '0').toString();
});
const feeAmountHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(Number(fees.value.fee) + Number(fees.value.mfee), tokenHydrated.value.decimals);
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});
const totalLockAmountHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(totalLockAmount.value, tokenHydrated.value.decimals);
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 9 });
});
const totalDebitAmount = computed(() => {
  return totalLockAmount.value;
});
const totalDebitAmountHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(totalDebitAmount.value, tokenHydrated.value.decimals);
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 9 });
});
const errorInsufficientBalanceForLocks = computed(() => {
  return Number(balance.value) < Number(totalDebitAmount.value);
});
const errorTotalLockAmountIsZero = computed(() => {
  return totalLockAmount.value === '0';
});

watch(tokenAddress, () => {
  loadToken();
});
watch(sClient, () => {
  loadToken();
  getFees();
});

const generateNonce = () => {
  addNonce.value++;
  return addNonce.value;
};
const connectWallet = () => {
  // root.$dialog.connectWalletDialog.open()
  //   .catch(e => {});
  connectwallet();
};
const openChainSwitcher = () => {
  // count.value=true;
  // router.push('/chain-switcher');
  chainSwitcher();
};
const addLock = () => {
  locks.value.push({
    owner: sClient.value.address,
    amount: '0',
    start_emission: 0,
    end_emission: moment().unix(),
    nonce: generateNonce(),
  });
};
const removeLock = (nonce) => {
  locks.value = locks.value.filter(item => item.nonce !== nonce);
};
const duplicate = (lock) => {
  const copied = { ...lock, nonce: generateNonce() };
  locks.value.push(copied);
};
const lockTokens = async () => {
  lockLoading.value = true;
  const lockParams = locks.value.map(lock => {
    const { nonce, ...rest } = lock;
    return rest;
  });

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  const defaultFee = {
    amount: [],
    gas: "500000",
  };

  confirmTxdialog()

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      CONTRACT_ADDRESS,
      {
        "lock": {
          "token": tokenAddress.value,
          "lock_params": lockParams,
        }
      },
      defaultFee,
      undefined,
      [
        {
          amount: String(Number(fees.value.fee) + Number(fees.value.mfee)),
          denom: SETTINGS.CHAIN_UDENOM[reqNetwork.value],
        }
      ]
    );

    rejectTxdialog();

    console.log("lock txhash: ", txhash);
  } catch (err) {
    console.log(err);
    rejectTxdialog();
    web3errDialog(err.message);
  }

  lockLoading.value = false;
};

const confirmTxdialog = inject('confirmTxdialog')
const rejectTxdialog = inject('rejectTxdialog')
const web3errDialog = inject('web3errDialog')

const approve = async () => {
  const amount = '340282366920938463463374607431768211455';
  approvalLoading.value = true;

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  const defaultFee = SETTINGS.CHAINS[reqNetwork.value].defaultFee;

  confirmTxdialog()

  try {
    const txhash = await sClient.value.signedClient.execute(
      sClient.value.address,
      tokenAddress.value,
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

    console.log("txhash", txhash);
    getAllowance();
    rejectTxdialog();
  } catch (err) {
    console.log(err);
    rejectTxdialog();
    web3errDialog(err.message);
  }

  approvalLoading.value = false;
};
const loadToken = async () => {
  try {
    await sClient.value.client.getContract(tokenAddress.value);
  } catch (err) {
    console.error('Invalid address');
    tokenHydrated.value = {};
    return;
  }

  showSearchLoader.value = true;

  const tokenInfoQuery = { token_info: {} };
  try {
    const tokenInfo = await sClient.value.client.queryContractSmart(tokenAddress.value, tokenInfoQuery);
    tokenHydrated.value = { ...tokenInfo, address: tokenAddress.value };
    if (locks.value.length === 0) {
      addLock();
    }
    getTokenBalance();
    getAllowance();
  } catch (error) {
    tokenHydrated.value = {};
  }

  showSearchLoader.value = false;
};
const getFees = async () => {
  const fees_ = { fee: "750000", mfee: "250000" };
  fees.value = fees_;
};
const getTokenBalance = async () => {
  if (!sClient.value.address || !tokenHydrated.value.address) {
    return;
  }

  const balanceQuery = {
    balance: { address: sClient.value.address },
  };

  try {
    const balance_ = await sClient.value.client.queryContractSmart(tokenAddress.value, balanceQuery);
    balance.value = balance_.balance;
  } catch (err) {
    console.log(err);
  }
};
const getAllowance = async () => {
  if (!sClient.value.address || !tokenHydrated.value.address) {
    return;
  }

  const allowanceQuery = { allowance: { owner: sClient.value.address, spender: SETTINGS.CHAINS[reqNetwork.value].tokenLocker } };
  const allowanceInfo = await sClient.value.client.queryContractSmart(tokenAddress.value, allowanceQuery);
  allowance.value = allowanceInfo.allowance;
};



// created(() => {
//   tokenAddress.value = route.query.token || '';
//   getFees();
// });
</script>
<style scoped>
.foreground {
  background: #fff;
}

.mobile-page {
  max-width: 100vw;
}

.c-list {
  cursor: pointer;
}
</style>
