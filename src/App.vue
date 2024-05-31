<template>
  <!-- <v-app :class="themeClass"> -->
  <v-app theme="dark" style="background-color: #06040c!important; box-shadow: 1px!important;">
    <!-- DESKTOP TOOLBAR -->
    <v-app-bar v-if="isDesktop" app flat height="80" absolute color="#0a0815">
      <v-toolbar-title class=" font-weight-bold d-sm-inline" href="#">
        <img :src="require('@/assets/img/logo.png')" height="50px" width="50px" style="vertical-align: middle;" />
        <div class="d-sm-inline" style="font-size: 1.2rem; ">
          ApexPad
        </div>
      </v-toolbar-title>
      <v-btn text rounded to="/browser">Browser</v-btn>
      <!-- <v-btn text rounded @click="clickBrowserButton">Browser</v-btn> -->
      <v-btn text rounded to="/liquidity">Liquidity</v-btn>
      <v-btn text rounded to="/token">Token</v-btn>
      <v-spacer></v-spacer>
      <v-btn text rounded @click="openChainSwitcher">
        <img :src="$settings.CHAINS[requiredNetwork].icon" height="24px" width="24px" class="mr-3 br-20" />
        <v-icon small>mdi-chevron-down</v-icon>
      </v-btn>
      <v-btn v-if="wrongNetwork" @click="connectWallet" small color="red" class="font-weight-bold" rounded depressed>
        Wrong network
      </v-btn>
      <!-- <v-btn v-else to="/connect-wallet" outlined  small class="font-weight-bold" rounded depressed> -->
      <v-btn v-else @click="connectWallet" outlined  small class="font-weight-bold" rounded depressed>
        <span v-if="!sClient.address">CONNECT</span>
        <span v-else>{{ sClient.address_condensed }}</span>
      </v-btn>

      <!-- <v-btn @click="toggleTheme">toggle theme</v-btn> -->
    </v-app-bar>

    <ChainSwitcherDialog />
    <ConnectWalletDialog />

    <!-- <transition> -->
      <router-view v-slot="{ Component, props }">
        <keep-alive>
          <component :is="Component" :message="dialog_handler">
          </component>
        </keep-alive>
      </router-view>
    <!-- </transition> -->

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
    ExchangeSwitcher
  },
  data(){
    return {
      dialog_handler : false
    }
  },
  setup() {
    const count=ref(false)
    const w_bool=ref(false)
    provide('message', count)
    provide('wallet', w_bool)

    const theme = useTheme();

    const store = useStore();
    const router = useRouter();
    const display = useDisplay();

    const showBackground = ref(false);
    const scrollFab = ref(false);
    const overlay = ref(true);
    const sClient = computed(() => store.state.signer);
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
      theme
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
