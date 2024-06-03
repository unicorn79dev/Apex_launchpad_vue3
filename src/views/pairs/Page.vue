<template>
  <v-container style="max-width: 600px; padding: 10px; padding-top: 10px;"  :class="{ 'pa-0 foreground': isXs }">
    <div class=" rounded-xl" style="background-color: #080917;opacity: 0.8;border:1px solid #4a4865;">
      <div class="pt-5 pb-3 pl-2 pr-2">
        <div class="mb-5 d-flex align-center inputcolor pa-3 r-outlined br-20">
          <!-- <c-input v-model:value="filters.search" placeholder="Pair address..."></c-input> -->
          <v-responsive
          class="mx-auto"
          max-width="100%"
          style="height: 50px;"
        >
          <v-text-field
            v-model="filters.search"
            :loading="loading"
            density="comfortable"
            rounded="pill"
            label="Token address..."
            variant="solo"
            hide-details="auto"
            single-line
            @click:append-inner="onClick"
            bg-color="#456"
            style="opacity: 0.8;height: 100%;"
          >
          <div style="position: absolute;right: 10px;">
            <v-progress-circular v-if="showSearchLoader" indeterminate width="2" class="mr-2" size="24" color="primary"></v-progress-circular>
            <v-icon v-if="filters.search === ''" style="">mdi-magnify</v-icon>
            <v-icon v-else @click="filters.search = ''">mdi-close</v-icon>
          </div>
          </v-text-field>
        </v-responsive>
        </div>
        <div class="d-flex align-center pl-2">
          <v-spacer></v-spacer>
        </div>
      </div>

      <div>
        <!-- PAGINATION -->
        <div v-if="pageCount > 1" class="d-flex align-center my-1 justify-end mr-2">
          <v-btn :disabled="page === 0" @click="firstPage" text icon color="text">
            <v-icon small>mdi-page-first</v-icon>
          </v-btn>
          <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text">
            <v-icon small>mdi-page-last</v-icon>
          </v-btn>
        </div>
        <!-- PAGINATION -->
      </div>

      <div v-if="firstLoad" class="text-center pa-12">
        <v-progress-circular
          indeterminate
          size="80"
          width="3"
          color="#aaa"
        >
          <img :src="require('@/assets/img/APEX.png')" height="50px" width="50px" class="greyscale">
        </v-progress-circular>
      </div>

      <row
        v-for="(item, i) of items"
        :key="item.address"
        :index="(page * filters.rowsPerPage) + i + 1"
        class="border-b"
        :item="item"
      ></row>

      <div v-if="items.length === 0 && !firstLoad" class="pa-4 text-center">
        <v-icon size="100" color="textFaint">mdi-magnify</v-icon>
        <div class="textFaint--text">No pairs found. Your filters may be too restricting.</div>
      </div>

      <!-- PAGINATION -->
      <div v-if="pageCount > 1" class="d-flex align-center my-2 justify-center">
        <v-btn :disabled="page === 0" @click="firstPage" text icon color="text">
          <v-icon small>mdi-page-first</v-icon>
        </v-btn>
        <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div class="px-2 textFaint--text">{{ page + 1 }} / {{ pageCount }}</div>
        <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text">
          <v-icon small>mdi-page-last</v-icon>
        </v-btn>
      </div>
      <!-- PAGINATION -->
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import _ from 'lodash';
import { useStore } from 'vuex';
import Row from '@/views/pairs/row';
import SETTINGS from '@/store/settings';

const store = useStore();
const items = ref([]);
const page = ref(0);
const filters = ref({
  rowsPerPage: 20,
  sort: 'lock_value',
  sortAscending: false,
  search: ''
});
const firstLoad = ref(true);
const loading = ref(false);
const showSearchLoader = ref(false);
const lock_stats = ref({});
const nextPageExists = ref(false);
const uniswapPairCount = ref(null);
const showAdvert = ref(true);
const rowCount = ref(0);

const sClient = computed(() => store.state.signer);
const reqNetwork = computed(() => store.state.requiredNetwork);

const totalLockedHuman = computed(() => {
  const amount = parseInt(lock_stats.value.tval);
  if (amount >= 1000000) {
    const deci = Number(amount / 1000000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${deci}M`;
  } else if (amount > 1000) {
    return `${Math.floor(amount / 1000)}k`;
  }
  return amount;
});

const pageCount = computed(() => Math.ceil(rowCount.value / filters.value.rowsPerPage));

// Use window.innerWidth for responsive breakpoints
const isXs = ref(window.innerWidth < 600);

const handleResize = () => {
  isXs.value = window.innerWidth < 600;
};

// Add event listener for resize events
onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchUniswapPairCount();
  normalLoad();
});

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const clearSearch = () => {
  filters.value.search = '';
};

const sortList = (sorting) => {
  showSearchLoader.value = true;
  if (filters.value.sort === sorting) {
    filters.value.sortAscending = !filters.value.sortAscending;
  } else {
    filters.value.sort = sorting;
    filters.value.sortAscending = false;
  }
  page.value = 0;
  normalLoad();
};

const nextPage = () => {
  if (page.value + 1 >= pageCount.value) {
    return;
  }
  showSearchLoader.value = true;
  page.value++;
  normalLoad();
};

const firstPage = () => {
  if (page.value === 0) {
    return;
  }
  showSearchLoader.value = true;
  page.value = 0;
  normalLoad();
};

const lastPage = () => {
  if (page.value === pageCount.value - 1) {
    return;
  }
  showSearchLoader.value = true;
  page.value = pageCount.value - 1;
  normalLoad();
};

const previousPage = () => {
  if (page.value <= 0) {
    return;
  }
  showSearchLoader.value = true;
  page.value--;
  normalLoad();
};

const normalLoad = _.debounce(async () => {
  const tokenLocks = await APIFetch();
  items.value = tokenLocks;
  rowCount.value = tokenLocks.length;
  const endOfPage = (page.value + 1) * filters.value.rowsPerPage;
  nextPageExists.value = endOfPage < tokenLocks.length;
}, 300, { leading: false });

const APIFetch = async () => {
  loading.value = true;
  let tokenLocks = [];

  try {
    const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker;

    const msg_locknum = {
      get_num_locked_tokens: {}
    };
    const numTokens = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg_locknum);
    console.log('NumToken = ', numTokens);

    for (let i = 0; i < numTokens; i++) {
      const msg = {
        get_locked_token_at_index: {
          index: i
        }
      };
      const address = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg);
      console.log('Address = ', address);

      tokenLocks = tokenLocks.concat({ address });
    }
  } catch (err) {
    console.log(err);
  }

  loading.value = false;
  showSearchLoader.value = false;
  firstLoad.value = false;

  return tokenLocks;
};

const fetchUniswapPairCount = () => {
  uniswapPairCount.value = 3;
};

watch(() => filters.value.search, (nv) => {
  showSearchLoader.value = true;
  page.value = 0;
  normalLoad();
});
</script>

<style scoped>
.foreground {
  background: #fff;
}
</style>
