<template>
  <!-- <v-app :class="themeClass"> -->
  <v-app theme="dark" style="background-color: #06040c!important; box-shadow: 1px!important;">
    <!-- <v-app :class="$store.state.theme === 'theme2' ? 'darktheme' : ''"> -->
    <!-- DESKTOP TOOLBAR -->
    <v-app-bar v-if="isDesktop" app flat height="80" absolute color="#0a0815" style="border-bottom: 1px solid #333;">
      <v-toolbar-title class=" font-weight-bold d-sm-inline" href="#">
        <img :src="require('@/assets/img/logo.png')" height="50px" width="50px" style="vertical-align: middle;" />
        <div class="d-sm-inline" style="font-size: 1.2rem; margin-right: 20px; ">
          ApexPad
        </div>
        <v-btn text rounded to="/browser">Browser</v-btn>
        <!-- <v-btn text rounded @click="clickBrowserButton">Browser</v-btn> -->
        <v-btn text rounded to="/liquidity">Liquidity</v-btn>
        <v-btn text rounded to="/token">Token</v-btn>
      </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text rounded @click="openChainSwitcher">
        <img :src="$settings.CHAINS[requiredNetwork].icon" height="24px" width="24px" class="mr-3 br-20" />
        <v-icon small>mdi-chevron-down</v-icon>
      </v-btn>
      <v-btn v-if="wrongNetwork" @click="connectWallet" small color="red" class="font-weight-bold" rounded depressed>
        Wrong network
      </v-btn>
      <!-- <v-btn v-else to="/connect-wallet" outlined  small class="font-weight-bold" rounded depressed> -->
      <v-btn v-else @click="connectWallet" outlined small class="font-weight-bold border mr-4" rounded depressed >
        <span v-if="!sClient.address">CONNECT</span>
        <span v-else>{{ sClient.address_condensed }}</span>
      </v-btn>
      <v-btn @click="confirmTxdialog" outlined small class="font-weight-bold border mr-4" rounded depressed>test</v-btn>

      <!-- <v-btn @click="toggleTheme">toggle theme</v-btn> -->
    </v-app-bar>

       <!-- MOBILE TOOLBAR -->
    <v-app-bar
      v-else
      app
      flat
      color="midground"
    >

      <v-toolbar-title class="font-weight-bold">
        <div class="">
          ApexPad
        </div>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text small rounded @click="$root.$dialog.chainSwitcher.open()">
        <img 
        :src="$settings.CHAINS[$store.state.requiredNetwork].icon" 
        height="24px"
        width="24px"
        class="mr-3 br-20">
        <v-icon small color="">mdi-chevron-down</v-icon>
      </v-btn>

      <div class="text-center">
        <v-btn
        v-if="wrongNetwork"
        @click="connectWallet"
        small
        color="red"
        :class="['font-weight-bold']"
        rounded depressed
        >
          Wrong network
          <!--
            <div class="caption ml-1">
            Switch your wallet to {{ $store.state.requiredNetwork }}
          </div>
          -->
        </v-btn>

        <v-btn
        v-else
        @click="connectWallet"
        small
        outlined
        :color="walletConnected ? 'text' : 'text'"
        :class="['font-weight-bold']"
        rounded depressed
        >
            <span v-if="!walletConnected">Connect</span>
            <span v-else>{{ sEthers.coinbase_condensed }}</span>
        </v-btn>
      </div>

      <!-- <div class="">
        <tx-spinner small color="text"></tx-spinner>
      </div> -->

      <v-btn small icon @click="openMenu" color="text" class="mr-1">
        <v-icon small>mdi-menu</v-icon>
      </v-btn>
      
    </v-app-bar>

    <web-3-error ref="web3Error"></web-3-error>
    <connect-wallet-dialog ref="connectWalletDialog"></connect-wallet-dialog>
    <confirm-tx-dialog ref="confirmTxInWallet"></confirm-tx-dialog>
    <testnet-dialog ref="testnetDialog"></testnet-dialog>
    <global-success-dialog ref="globalSuccessDialog"></global-success-dialog>
    <chain-switcher-dialog ref="chainSwitcherDialog"></chain-switcher-dialog>

    <!-- <transition> -->
      <router-view v-slot="{ Component, props }">
        <keep-alive>
          <component :is="Component" :message="dialog_handler">
          </component>
        </keep-alive>
      </router-view>
    <!-- </transition> -->

    <!-- DESKTOP FOOTER -->
    <!-- <div style="background-color:white;justify-content: center;"> -->
      <v-footer v-if="isDesktop" class="pa-3 justify-center" color="#0a0815" style="background-color: #0a0815; width: 100%;justify-content: center; max-height: 80px; position: absolute; bottom: 0%;">
         <v-btn icon color="textFaint" x-large href="https://twitter.com/" target="_blank">
           <v-icon>mdi-twitter</v-icon>
         </v-btn>
         <v-btn color="textFaint" x-large icon rounded href="https://t.me/" target="_blank">
           <v-icon>mdi-telegram</v-icon>
         </v-btn>
        </v-footer>
     <!-- </div> -->
     <!-- END DESKTOP FOOTER -->
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch, defineComponent, provide } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useDisplay, useTheme } from 'vuetify';
import Web3Error from '@/views/DialogWeb3Error';
import ConfirmTxDialog from '@/web3/confirm-tx-in-wallet';
import ConnectWalletDialog from '@/web3/connect-dialog';
import TokenPage from '@/views/tokens/token-page';
import ConnectProvider from '@/web3/connect-provider';
import MainMenu from '@/components/ui/main-menu';
import TestnetDialog from '@/components/dialogs/testnet-only-dialog';
import GlobalSuccessDialog from '@/components/dialogs/global-success-dialog';
import ChainSwitcherDialog from '@/components/dialogs/chain-switcher-dialog';
import Utils from '@/web3/utils';
import ExchangeSwitcher from "@/views/ExchangeSwitcher";
import footer from '@/components/footer';


export default defineComponent( {
  name: 'App',
  components: {
    Web3Error,
    ConnectWalletDialog,
    ConfirmTxDialog,
    MainMenu,
    TokenPage,
    TestnetDialog,
    GlobalSuccessDialog,
    ChainSwitcherDialog,
    ExchangeSwitcher,
    footer
  },
  data(){
    return {
      dialog_handler : false
    }
  },
  setup() {
    const count=ref(false)
    const w_bool=ref(false)
    const confirmTx=ref(false)
    const web3err=ref(false)
    const errmsg=ref('')
    provide('message', count)
    provide('wallet', w_bool)

    provide('confirmTx', confirmTx);
    provide('errmsg', errmsg);
    provide('web3err', web3err)

    const theme = useTheme();

    const store = useStore();
    const router = useRouter();
    const display = useDisplay();

    const showBackground = ref(false);
    const scrollFab = ref(false);
    const overlay = ref(true);
    const sClient = computed(() => store.state.signer);
    provide('signer', sClient);
    const wrongNetwork = computed(() => store.state.wrongNetwork);
    const requiredNetwork = computed(() => store.state.requiredNetwork);
    const isMainnet = computed(() => ['INJ', 'SEI'].includes(store.state.requiredNetwork));
    const walletConnected = computed(() => !!sClient.value.address);
    const darkMode = computed(() => {
      const theme = store.state.theme;
      return theme === 'theme2' || theme === 'theme3';
    });

    const isDesktop = computed(() => window.innerWidth >= 960);
    const themeClass = computed(() => (store.state.theme === 'theme2' ? 'darktheme' : ''));
    const initializeApp = () => {
      let theme = localStorage.getItem('theme');
      if (!['theme1', 'theme2', 'theme3'].includes(theme)) {
        theme = 'theme2';
      }
      store.commit('setTheme', { themeName: theme });
    };


    const toggleTheme = () => {
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }

    const wssReconnect = () => {
      if (!sClient.value.coinbase) {
        ConnectProvider.connectViewOnlyProvider();
      }
    };

    const disconnect = () => {
      ConnectProvider.disconnect();
    };

    const openMenu = () => {
      router.push('/menu');
    };

    const connectWallet = () => {
      w_bool.value=true;
      // router.push('/connect-wallet');
    };
    provide('connectwallet', connectWallet);

    const confirmTxdialog = () => {
    console.log('confirmtx')
      confirmTx.value=true;
    };
    provide('confirmTxdialog', confirmTxdialog);
    const rejectTxdialog = () => {
      confirmTx.value=false;
    };
    provide('rejectTxdialog', rejectTxdialog);

    const web3errDialog = (msg) => {
      web3err.value=true;
      errmsg.value=msg;
    };
    provide('web3errDialog', web3errDialog);

    const openChainSwitcher = () => {
      console.log('test========================>click event test', this)
      count.value=true;
      // router.push('/chain-switcher');
    };

    provide('chainswitcher', openChainSwitcher);

    const wrongNetworkCheck = async () => {
      // Implement functionality
    };

    const clickBrowserButton = () => {
      // Implement functionality
    };

    const onScroll = (e) => {
      if (typeof window === 'undefined') return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      scrollFab.value = top > 20;
    };

    const toTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatAmount = (_amount, _decimals) => {
      var amount = Utils.convertMicroDenomToDenom(_amount, _decimals)
      // var maxDigits = ethers.BigNumber.from(_amount).gt(ethers.BigNumber.from(10).pow(_decimals)) ? 2 : _decimals
      var maxDigits = _decimals
      if (_decimals > 0) {
        if (_amount > 10 ** (_decimals - 1)) {
          maxDigits = 2
        }
      }
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: maxDigits})
    }
    provide('formatAmount', formatAmount)

    watch(requiredNetwork, () => {
      wrongNetworkCheck();
    });

    onMounted(() => {
      ConnectProvider.connectViewOnlyProvider();
      initializeApp();
      setTimeout(() => {
        overlay.value = false;
      }, 2500);
    });

    return {
      showBackground,
      scrollFab,
      overlay,
      sClient,
      wrongNetwork,
      requiredNetwork,
      isMainnet,
      walletConnected,
      darkMode,
      initializeApp,
      wssReconnect,
      disconnect,
      openMenu,
      connectWallet,
      openChainSwitcher,
      wrongNetworkCheck,
      clickBrowserButton,
      onScroll,
      toTop,
      themeClass,
      isDesktop,
      theme,
      footer,
      confirmTxdialog
    };
  },
});
</script>

<style scoped>
  .ima {
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.93)), url(https://cdn.pixabay.com/photo/2016/08/03/09/03/universe-1566159_1280.jpg);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .radial-gr {
    right: 0px;
    pointer-events: none;
    height: 200vh;
    mix-blend-mode: color;
    background: radial-gradient(50% 50% at 50% 50%, rgba(33, 114, 229, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 9999;
    transform: translateY(-110vh);
    max-width: 100vw !important;
  }

  .radial-gr-mobile {
    right: 0px;
    pointer-events: none;
    height: 200vh;
    mix-blend-mode: color;
    background: radial-gradient(50% 50% at 50% 50%, rgba(33, 114, 229, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 9999;
    transform: translateY(-110vh);
    max-width: 100vw !important;
  }

  .darktheme .v-app {
    background-color: #121212;
    color: #ffffff;
  }
</style>
