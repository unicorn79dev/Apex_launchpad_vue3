<template>
  <v-container style="max-width: 600px;">
    <v-card :class="['br-20 mb-16', isXs ? 'pa-4' : 'pa-6']">
      <div class="d-flex align-center">
        <v-btn icon :to="`/browser/pairs`" color="text">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </div>
      <div class="mt-4 mb-6 text-center">
        <v-btn text color="textFaint" rounded :href="`${address}`" target="_blank">
          {{ address }}
          <v-icon x-small>mdi-arrow-top-right</v-icon>
        </v-btn>
      </div>
      <div>
        <template v-if="items.length > 0">
          <div class="d-flex mt-4 textFaint--text font-italic">
            <div>Locked amount</div>
            <v-spacer></v-spacer>
            <div class="mr-9">Unlock date</div>
          </div>
          <div>
            <unlock-row v-for="(item, index) in items" :item="item" :key="index" :reserveUSD="reserveUSD" :totalSupply="totalSupply"></unlock-row>
          </div>
        </template>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import _ from 'lodash';
import { useStore } from 'vuex';
import UnlockRow from './unlock-row';
import SETTINGS from '@/store/settings';

const props = defineProps({
  address: {
    type: String,
    required: true
  }
});

const store = useStore();

const pair = ref({
  token0: {},
  token1: {}
});
const totalLockedTokens = ref('0');
const items = ref([]);
const totalSupply = ref('0');
const reserveUSD = ref('0');
const loadingLockedLiquidity = ref(true);
const loadingPOL1 = ref(true);
const POL1Length = ref(0);
const POL1SyncIndex = ref(0);
const uniswapAPIIsDown = ref(false);

const sClient = computed(() => store.state.signer);

// Use window.innerWidth for responsive breakpoints
const isXs = ref(window.innerWidth < 600);

const handleResize = () => {
  isXs.value = window.innerWidth < 600;
};

// Add event listener for resize events
onMounted(() => {
  window.addEventListener('resize', handleResize);
  loadAPI();
  doFirstLoad();
});

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const totalSupplyHuman = computed(() => {
  return 0;
  // return Number(ethers.utils.formatUnits(totalSupply.value, 18)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
});

const totalLockedHuman = computed(() => {
  return 0;
  // return Number(ethers.utils.formatUnits(totalLockedTokens.value, 18)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
});

const percentOfTotal = computed(() => {
  return 0;
  // return totalSupply.value === '0' ? '0' : (ethers.BigNumber.from(totalLockedTokens.value).mul(1000).div(totalSupply.value).toNumber() / 10).toString();
});

const reserveValueHuman = computed(() => {
  return 0;
  // return Number(reserveUSD.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const lockedValueHuman = computed(() => {
  return 0;
  // return totalSupply.value === '0' ? '0' : Number((reserveUSD.value * ethers.BigNumber.from(totalLockedTokens.value).mul(10000000000).div(totalSupply.value).toNumber() / 10000000000)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const POL1Progress = computed(() => {
  return 0;
  // return POL1Length.value === 0 ? 0 : (POL1SyncIndex.value / POL1Length.value) * 100;
});

const token0Symbol = computed(() => {
  return 'xxx';
  // return pair.value.token0.address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ? 'ETH' : pair.value.token0.symbol;
});

const token1Symbol = computed(() => {
  return 'yyy';
  // return pair.value.token1.address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' ? 'ETH' : pair.value.token1.symbol;
});

const loadAPI = _.debounce(() => {
  console.log("loading api...");
  return new Promise((resolve, reject) => {
    // axios.get(`/uniswap/pair/${props.address}?network=${store.state.ethers.network}`)
    //   .then(response => {
    //     pair.value = response.data;
    //   })
    //   .then(resolve)
    //   .catch(reject);
  });
}, 500, { leading: true });

const loadLocks = async () => {
  console.log("load locks...");
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[store.state.requiredNetwork].lpLocker;

  const msg_ = {
    "get_lock_for_token": {
      "lptoken": props.address,
    }
  };

  const tokenLock = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg_);
  console.log("TokenLock = ", tokenLock);

  items.value = tokenLock;
};

const getUniswapTotalSupply = async () => {
  // Implement the logic to get the total supply
};

const getReserveUSD = () => {
  // Implement the logic to get the reserve USD
};

const doFirstLoad = async () => {
  await getUniswapTotalSupply(); // this needs to be called before loadLocks
  loadLocks().finally(() => {
    loadingLockedLiquidity.value = false;
  });
};
</script>

<style scoped>
.foreground {
  background: #fff;
}
.c-list {
  cursor: pointer;
}
</style>
