<template>
  <v-btn small rounded outlined @click="$root.tokenPage.open(address)" class="pl-1 font-weight-medium textFaint--text">
    <coin-icon :address="address" :url="icon" class="mr-2" :size="20"></coin-icon>

    <v-progress-circular v-if="firstLoad" indeterminate size="16" width="1" color="textFaint"></v-progress-circular>

    <template v-else>
      ${{ priceHuman }}
      <v-icon x-small color="textFaint">mdi-chevron-up</v-icon>
    </template>
  </v-btn>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
});

const live_info = ref({
  total_supply: '0',
  dayData: {}
});
const pdiff = ref('0');
const loadingLiveData = ref(false);
const firstLoad = ref(true);
const newTokenLoad = ref(true);
let intervalID = null;
const item = ref({
  price_usd: ''
});

const priceHuman = computed(() => {
  const value = Number(item.value.price_usd);
  let digits = 2;
  if (value > 1000) {
    digits = 0;
  } else if (value > 0.1) {
    digits = 2;
  } else if (value > 0.001) {
    digits = 4;
  } else if (value > 0.0001) {
    digits = 5;
  }
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits });
});

const fetchLivePrices = () => {
  loadingLiveData.value = true;
  fetchLivePricesRaw()
    .then(() => {})
    .catch(e => {
      console.log(e);
    })
    .then(() => {
      loadingLiveData.value = false;
      firstLoad.value = false;
    });
};

const fetchLivePricesRaw = async () => {
  // Implementation of data fetching goes here.
  // Example commented out implementation:
  // const itemAddress = props.address;
  // const data = {
  //   query: `
  //   {
  //     tokenDayDatas(first: 2, orderBy: date, orderDirection: desc,
  //       where: {
  //         token: "${itemAddress.toLowerCase()}"
  //       }
  //     ) {
  //       id
  //       date
  //       priceUSD
  //       dailyTxns
  //       totalLiquidityUSD
  //       dailyVolumeUSD
  //     }
  //   }
  //   `
  // };
  // const response = await axios.post(this.$store.state.graphExplorer, data);
  // const dayData = response.data.data.tokenDayDatas[0];
  // if (response.data.data.tokenDayDatas.length > 1) {
  //   const yesterday = response.data.data.tokenDayDatas[1];
  //   const diff = dayData.priceUSD - yesterday.priceUSD;
  //   const pdiffValue = (diff / yesterday.priceUSD) * 100;
  //   pdiff.value = pdiffValue;
  // }
  // item.value.price_usd = dayData.priceUSD;
  // live_info.value.dayData = dayData;
};

onMounted(() => {
  fetchLivePrices();
  intervalID = setInterval(fetchLivePrices, 8000);
});

onUnmounted(() => {
  clearInterval(intervalID);
});

const activated = () => {
  intervalID = setInterval(fetchLivePrices, 8000);
};

const deactivated = () => {
  clearInterval(intervalID);
};

</script>
