<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20" style="background-color: #11111f; border:1px solid #777;">
      <div>
        <v-row class="pa-4 ma-0 font-weight-medium background align-center" style="background-color: #111111;">
          <div>Connect your wallet</div>
          &nbsp;
          <v-progress-circular v-if="loadConnect" indeterminate size="20" width="2" color="text"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-btn @click="close" icon color="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <v-expand-transition mode="out-in">
          <v-card v-if="sClient.address" outlined class="background blocks br-0 d-flex align-center pa-3" >
            <img :src="require('@/assets/img/APEX.png')" width="40px">
            <div class="ml-3" style="flex: 1;">
              <div class="caption d-flex align-center white--text font-weight-medium">
                <CopyAddress :address="sClient.address" color="white"></CopyAddress>
                <v-spacer></v-spacer>
                Connected
              </div>
              <div class="d-flex align-center white--text">
                {{ coinBalanceHuman }} {{ $store.state.nativeGasTokenSymbol }}
                <v-spacer></v-spacer>
                <v-btn color="white" depressed class="blue--text" small rounded @click="disconnect">
                  Disconnect
                  <v-icon small class="ml-1">mdi-exit-to-app</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-expand-transition>

        <div @click="connectToKeplr" class="c-list border-b pa-4 d-flex align-center">
          <img src="https://assets-global.website-files.com/634cded3a83bb67e764ed8e5/64eb418a3feded5cf740ccc3_keplr-icon.svg" width="30px" class="mr-3">
          <div class="font-weight-bold d-flex align-center">
            Keplr
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import ConnectProvider from './connect-provider';
import SETTINGS from '@/store/settings';
import Utils from '@/web3/utils';
import CopyAddress from '@/components/ui/copy-address'

export default {
  name: 'ConnectWalletDialog',
  components: {
    CopyAddress
  },
  setup() {
    const message = inject('wallet');

    const store = useStore();
    const breakpoint= useDisplay();

    // const dialog = ref(true);
    const dialog = message;
    const loadConnect = ref(false);
    const nativeCoinBalance = ref('0');
    console.log(breakpoint)
    const tab = ref(breakpoint.xs ? 1 : 0); // Equivalent logic for breakpoint

    let resolve;
    let reject;

    const sClient = computed(() => store.state.signer);
    const sClientWatcher = computed(() => sClient.value.watcher);
    const wrongNetwork = computed(() => store.state.wrongNetwork);
    const requiredNetwork = computed(() => store.state.requiredNetwork);
    const addressCondensed = computed(() => {
      const address = sClient.value.address;
      if (!address) return '';
      return address.slice(0, 6) + '...' + address.slice(address.length - 4);
    });
    const coinBalanceHuman = computed(() => {
      const amount = Utils.convertMicroDenomToDenom(nativeCoinBalance.value.amount, SETTINGS.CHAIN_DECIMALS[requiredNetwork.value]);
      return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    });

    watch(sClientWatcher, getNativeCoinBalance);

    async function getNativeCoinBalance() {
      if (!sClient.value.address) return;
      const coinBalance = await sClient.value.client.getBalance(sClient.value.address, sClient.value.denom);
      nativeCoinBalance.value = coinBalance;
    }

    function open() {
      tab.value = breakpoint.xs ? 1 : 0;
      dialog.value = true;
      return new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    function close() {
      dialog.value = false;
      if (reject) reject();
    }

    function closeAndResolve() {
      dialog.value = false;
      if (resolve) resolve();
    }

    function requireConnectionThen(callback) {
      if (!sClient.value.address) {
        open()
          .then(() => callback())
          .catch(() => {});
      } else {
        callback();
      }
    }

    async function connectToKeplr() {
      loadConnect.value = true;
      await ConnectProvider.connectToKeplr();
      closeAndResolve();
      loadConnect.value = false;
    }

    function disconnect() {
      ConnectProvider.disconnect();
    }

    return {
      dialog,
      loadConnect,
      nativeCoinBalance,
      tab,
      sClient,
      wrongNetwork,
      requiredNetwork,
      addressCondensed,
      coinBalanceHuman,
      open,
      close,
      closeAndResolve,
      requireConnectionThen,
      connectToKeplr,
      disconnect,
    };
  },
};
</script>

<style scoped>
/* Your styles here */
.draw-icon {
  fill: transparent;
  stroke-width: 5px;

  path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dash 1.5s linear forwards;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
