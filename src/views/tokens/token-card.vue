<template>
  <div class="pb-6">
    <div class="d-flex align-center pa-4">
      <template v-if="!newTokenLoad">
        <coin-icon :address="item.address" :url="item.icon_url" :network="network" class="mr-3"></coin-icon>
        <div class="title font-weight-bold">
          {{ tokenHydrated.symbol }}
        </div>
        <div class="textFaint--text ml-2">
          {{ tokenHydrated.name }}
        </div>
      </template>
      <v-spacer></v-spacer>

      <enmt-badge v-if="!newTokenLoad && tokenHydrated.isENMT"></enmt-badge>

      <v-btn icon @click="$emit('on-close')" color="textFaint">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div style="height: 380px;">

      <div v-if="newTokenLoad" class="text-center" style="position:absolute;left: 0; right: 0;">
        <v-progress-circular
        indeterminate
        size="120"
        width="2"
        color="#aaa">
          <img 
          :src="require('@/assets/img/APEX.png')" 
          height="100px"
          class="greyscale"
          width="100px">
        </v-progress-circular>
      </div>

      <v-scroll-x-transition mode="out-in">
        <div v-if="!newTokenLoad" style="height: 100%;">

          <div class="pl-1 d-flex py-1 background">
            <v-btn small rounded text @click="tab = 0" :color="tab === 0 ? 'primary' : 'textFaint'">
              Chart
            </v-btn>
            <v-btn small rounded text @click="tab = 1" :color="tab === 1 ? 'primary' : 'textFaint'">
              Info
            </v-btn>
            <v-btn small rounded text @click="tab = 2" :color="tab === 2 ? 'primary' : 'textFaint'">
              Tknomics
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn small rounded color="textFaint" text :href="`${$settings.AMMS[exchange].ammTokenLink}${item.address}`" target="_blank">
              Trade
              <v-icon x-small>mdi-arrow-top-right</v-icon>
            </v-btn>

            <div v-if="!loggedIn" class="text-end mr-6">
              <v-btn text small @click="accountIntercept" rounded color="textFaint">
                <v-icon small class="mr-1">mdi-star-outline</v-icon>
                Watchlist
              </v-btn>
            </div>

            <div v-else class="text-end">
              <v-btn v-if="tokenInWatchlist" small @click="removeFromWatchlist" rounded text color="primary">
                <v-icon small class="mr-1">mdi-star-outline</v-icon>
                Watchlist
              </v-btn>
              <v-btn v-else @click="addToWatchlist" small text rounded color="textFaint">
                <v-icon small class="mr-1">mdi-star-outline</v-icon>
                Watchlist
              </v-btn>
            </div>
          </div>

          <v-scroll-x-transition mode="out-in">
            <div v-if="tab === 0" style="height: 100%;">
              <div v-if="network === 'Kovan'" style="height: 100%;" class="pa-8 d-flex flex-column align-center justify-center textFaint--text">
                <v-icon size="100" color="textFaint">mdi-chart-line</v-icon>
                <div>
                  No charts available for Kovan network
                </div>
              </div>
              <div v-else>
                <v-row dense class="align-end pa-4">
                  <v-col cols="4" class="text-center">
                    <div>
                      <div class="">
                        ${{ fullyDilutedMcap }}
                      </div>
                      <div class="textFaint--text t-small">
                        Fully diluted mcap
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center">
                    <div>
                      <div class="">
                        ${{ volume24hrHuman }}
                      </div>
                      <div class="textFaint--text t-small">
                        Volume 24hr
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center">
                    <div>
                      <div class="title">
                        <div :class="[item.change_24 >= 0 ? 'primary--text' : 'pink--text']">
                          ${{ priceHuman }}
                        </div>
                      </div>
                      <div class="textFaint--text t-small">
                        Price
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <lchart :address="mostLiquidPair.address" :tokenAddress="item.address" :exchange="exchange"></lchart>

                <v-row dense class="px-4 mb-2 caption mt-2">
                  <v-col cols="4" class="text-center">
                    <div class="font-weight-regular textFaint--text">
                      30d: 
                      <span :class="['font-weight-bold', item.change_30d >= 0 ? 'primary--text' : 'pink--text']">{{ change30d }}%</span>
                      <v-progress-linear rounded height="4" :value="Math.abs(item.change_30d)" :color="item.change_30d >= 0 ? 'primary' : 'pink'" background-color=""></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center">
                    <div class="font-weight-regular textFaint--text">
                      7d: 
                      <span :class="['font-weight-bold', item.change_7d >= 0 ? 'primary--text' : 'pink--text']">{{ change7d }}%</span>
                      <v-progress-linear rounded height="4" :value="Math.abs(item.change_7d)" :color="item.change_7d >= 0 ? 'primary' : 'pink'" background-color=""></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center textFaint--text">
                    <div>
                      1d: <span :class="['font-weight-bold', item.change_24 >= 0 ? 'primary--text' : 'pink--text']">{{ change24hr }}%</span>
                      <v-progress-linear rounded height="4" :value="Math.abs(item.change_24)" :color="item.change_24 >= 0 ? 'primary' : 'pink'" background-color=""></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>
              </div>

            </div>

            <div v-else-if="tab === 1">

              <div class="text-center mt-4">
                <v-btn rounded class="green-button white--text" @click="goToTokenPage">
                  <coin-icon :address="tokenHydrated.address" :url="item.icon_url" :network="network" :size="22" class="mr-3"></coin-icon>
                  View Token page
                </v-btn>
              </div>

              <div class="px-4 text-center">
                <copy-address :address="tokenHydrated.address" color="textFaint"></copy-address>
                <v-btn small color="textFaint" text :href="`${$settings.AMMS[exchange].ammTokenLink}${tokenHydrated.address}`" target="_blank">
                  {{ exchange }}
                  <v-icon x-small>mdi-arrow-top-right</v-icon>
                </v-btn>
                <v-btn small color="textFaint" text :href="`${$settings.ETHERSCAN_URL[network]}/address/${tokenHydrated.address}`" target="_blank">
                  {{ $settings.EXPLORER_NAME[network] }}
                  <v-icon x-small>mdi-arrow-top-right</v-icon>
                </v-btn>
                <v-btn icon color="textFaint" class="ml-1" :href="`https://twitter.com/search?q=%24${tokenHydrated.symbol}&src=typed_query`" target="_blank">
                  <v-icon>mdi-twitter</v-icon>
                </v-btn>
              </div>

              <div class="textFaint--text text-center mt-2 caption">
                Total Supply: {{ totalSupplyHuman }}
              </div>

              <div class="textFaint--text text-center caption font-italic">
                Decimals {{ item.decimals }}
              </div>

              <div v-if="false" class="textFaint--text caption text-center">
                {{ exchange }} index: {{ item.first_uniswap_index }}
              </div>

              <div style="min-height: 139px;">
                <div v-if="pairs.length > 0">
                  <div class="caption pl-4 textFaint--text text-center mt-2">
                    Most liquid pair
                  </div>
                  <pair-row
                  v-for="item of pairs" 
                  :key="item.address"
                  :exchange="exchange"
                  :item="item"
                  class="border-t v-card br-20 ma-2">
                  </pair-row>
                </div>
                <div v-else class="pa-2">
                  <v-card outlined class="background textFaint--text br-20 pa-4">
                    No pairs on {{ exchange }} for this token yet
                  </v-card>
                </div>
              </div>

            </div>

            <div v-else-if="tab === 2">
              <tokenomics-card v-if="tokenHydrated.address" :tokenHydrated="tokenHydrated" :network="network" class="border-t"></tokenomics-card>
            </div>
          </v-scroll-x-transition>

        </div>
      </v-scroll-x-transition>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import PairRow from '@/views/pairs/row';
import lchart from '@/views/token/lchart';
import TokenomicsCard from '@/views/locker/erc20/global-token/tokenomics';

const store = useStore();
const $settings = store.state.$settings;
const $emit = defineEmits(['on-close']);

const props = defineProps({
  address: String,
  network: String,
  exchange: String,
  item: Object,
});

const tab = ref(0);
const live_info = ref({
  dayData: {},
});
const pdiff = ref('0');
const newTokenLoad = ref(true);
let intervalID = null;

const item = ref({
  address: ''
});
const pairs = ref([]);
const mostLiquidPair = ref({});
const exchange = ref(null);
const network = ref(null);
const tokenHydrated = ref({
  symbol: '',
  name: '',
  decimals: '0',
  totalSupply: '0'
});

const loggedIn = computed(() => store.state.user.username);

const change24hr = computed(() => {
  const value = item.value.change_24;
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
});

const change7d = computed(() => {
  const value = item.value.change_7d;
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
});

const change30d = computed(() => {
  const value = item.value.change_30d;
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
});

const totalSupplyHuman = computed(() => {
  return 0;
  // var tsupply = ethers.utils.formatUnits(tokenHydrated.value.totalSupply, tokenHydrated.value.decimals);
  // return Number(tsupply).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const volume24hrHuman = computed(() => {
  let amount = parseInt(item.value.volume24hr);
  if (amount >= 1000000000) {
    const bil = Number(amount / 1000000000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return bil + 'B';
  } else if (amount >= 1000000) {
    const mil = Number(amount / 1000000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return mil + 'M';
  } else if (amount > 1000) {
    return Math.floor(amount / 1000) + 'k';
  }
  return amount;
});

const priceHuman = computed(() => {
  const st = Math.floor(1 / item.value.price_usd).toString();
  const precision = st.length + 1;
  const value = Number(item.value.price_usd);
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: precision });
});

const fullyDilutedMcap = computed(() => {
  const amount = item.value.price_usd * (tokenHydrated.value.totalSupply / Math.pow(10, tokenHydrated.value.decimals));
  if (amount >= 1000000000) {
    const bil = Number(amount / 1000000000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return bil + 'B';
  } else if (amount >= 1000000) {
    const mil = Number(amount / 1000000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return mil + 'M';
  } else if (amount > 1000) {
    return Math.floor(amount / 1000) + 'k';
  }
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

const tokenInWatchlist = computed(() => {
  const wkeys = Object.keys((store.state.user.watchlist[network.value] || {})[exchange.value] || {});
  return wkeys.includes(String(item.value.id));
});

const addToWatchlist = () => {
  // Add token to watchlist logic
};

const removeFromWatchlist = () => {
  // Remove token from watchlist logic
};

const accountIntercept = () => {
  store.$root.$dialog.accountInterceptDialog.open()
    .then(response => {
      if (response === 'redirect') {
        $emit('on-close');
      }
    });
};

const reload = (token) => {
  live_info.value = {
    dayData: {},
  };
  pdiff.value = '0';
  fetchLivePrices(token);
};

const loadToken = async (address, network = null, exchange = null) => {
  // this.network = network || this.$store.state.requiredNetwork
  // this.exchange = exchange || this.$store.state.exchange
  // if (!this.exchange || this.$settings.AMMS[this.exchange].chain !== this.network) {
  //   var amms = Object.keys(this.$settings.AMMS).filter(key => this.$settings.AMMS[key].chain === this.network)
  //   this.exchange = amms[0]
  // }
  // this.newTokenLoad = true
  // this.tokenHydrated = await ERC20.getERC20(address, this.network)
  // this.doLoad(address)
  //   .then(() => {})
  //   .catch(e => {})
  //   .then(() => {
  //     this.newTokenLoad = false
  //     /* setTimeout(() => {
  //       this.newTokenLoad = false
  //     }, 3000) */
  //   })
  // this.fetchLivePrices()
  // this.intervalID = setInterval(this.fetchLivePrices, 8000)
};

const doLoad = async (address) => {
  // this.tab = 0
  // var token_response = await axios.get(`${this.$settings.AMMS[this.exchange].server}/erc20/token/${address}`)
  // var pair_response = await axios.get(`${this.$settings.AMMS[this.exchange].server}/uniswap/token/${address}/most-liquid-pair`)
  // this.item = token_response.data
  // this.pairs = pair_response.data.rows
  // if (pair_response.data.rows.length > 0) {
  //   this.mostLiquidPair = pair_response.data.rows[0]
  // } else {
  //   this.mostLiquidPair = {}
  // }
};

const stopRefresher = () => {
  clearInterval(intervalID);
  tab.value = 0;
};

const fetchLivePrices = () => {
  fetchLivePricesRaw()
    .then(() => {})
    .catch(e => {});
};

const goToTokenPage = () => {
  store.$root.ammLinkTwo(`/token/${tokenHydrated.value.address}`, exchange.value);
  $emit('on-close');
};

const fetchLivePricesRaw = async () => {
  // var itemAddress = this.item.address
  // var data = {
  //   query: `
  //   {
  //     tokenDayDatas(first:2, orderBy: date, orderDirection: desc,
  //       where: {
  //         token: "${itemAddress.toLowerCase()}"
  //       }
  //     ) {
  //         id
  //         date
  //         priceUSD
  //         dailyTxns
  //         totalLiquidityUSD
  //         dailyVolumeUSD
  //     }
  //   }
  //   `
  // }
  // var info = {}
  // var graphExplorer = this.$settings.AMMS[this.exchange].graphExplorer
  // var response = await axios.post(graphExplorer , data)
  // if (this.item.address !== itemAddress) {
  //   return
  // }
  // var dayData = response.data.data.tokenDayDatas[0]
  // var yesterday = response.data.data.tokenDayDatas[1]
  // var diff = dayData.priceUSD - yesterday.priceUSD
  // var pdiff = diff / yesterday.priceUSD * 100
  // info.dayData = dayData

  // if (itemAddress === this.item.address) {
  //   this.live_info = info
  //   this.pdiff = pdiff
  //   this.item.price_usd = dayData.priceUSD
  // } else {
  // }
};

onMounted(() => {
  fetchLivePrices();
  intervalID = setInterval(fetchLivePrices, 8000);
});

onUnmounted(() => {
  clearInterval(intervalID);
});
</script>
