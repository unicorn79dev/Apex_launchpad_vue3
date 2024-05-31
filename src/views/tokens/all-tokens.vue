<template>
  <div style="height: 350px;" class="rounded-lg">
    <!-- <div> -->
      <div :class="['d-flex align-center mt-5 mb-3 pa-3  br-20 mx-2', 'inputcolor']">
        <!-- <v-input v-model:value="filters.search" placeholder="Token address..." class=""></v-input> -->
        <v-responsive
          class="mx-auto"
          max-width="100%"
          style="border-radius: 30px;height: 40px;"
        >
          <v-text-field
            v-model="filters.search"
            :loading="loading"
            density="compact"
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
    <!-- </div> -->

    <div v-if="firstLoad" class="text-center pa-12">
      <v-progress-circular indeterminate size="80" width="3" color="#aaa">
        <img :src="require('@/assets/img/APEX.png')" class="greyscale" height="50px" width="50px">
      </v-progress-circular>
    </div>

    <v-scroll-x-transition>
      <div v-if="!firstLoad">
        <div :class="['d-flex align-center border-b border-t', 'px-2']">
          <v-spacer></v-spacer>
          <div class="d-flex align-center my-2 justify-center">
            <!-- <v-btn :disabled="page === 0" @click="firstPage" text icon color="text"> -->
              <v-icon x-small :disabled="page === 0" @click="firstPage">mdi-page-first</v-icon>
            <!-- </v-btn> -->
            <!-- <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text"> -->
              <v-icon x-small @click="previousPage" :disabled="page <= 0">mdi-chevron-left</v-icon>
            <!-- </v-btn> -->
            <!-- <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text"> -->
              <v-icon x-small :disabled="!nextPageExists" @click="nextPage">mdi-chevron-right</v-icon>
            <!-- </v-btn> -->
            <!-- <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text"> -->
              <v-icon x-small :disabled="!nextPageExists" @click="lastPage">mdi-page-last</v-icon>
            <!-- </v-btn> -->
          </div>
        </div>

        <token-row v-for="(item, i) in items" :key="item.address" :item="item" :index="(page * filters.rowsPerPage) + i + 1"></token-row>

        <div v-if="items.length === 0 && !firstLoad" class="pa-4 text-center">
          <v-icon size="100" color="textFaint">mdi-magnify</v-icon>
          <div class="textFaint--text">
            No tokens found. Your filters may be too restricting.
          </div>
          <v-btn class="mt-4" @click="disableFilters" outlined rounded>
            Disable filters
          </v-btn>
        </div>

        <div v-if="pageCount > 1" class="d-flex align-center my-2 justify-center">
          <v-btn :disabled="page === 0" @click="firstPage" text icon color="text">
            <v-icon small>mdi-page-first</v-icon>
          </v-btn>
          <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div class="px-2 textFaint--text">
            {{ page + 1 }} / {{ pageCount }}
          </div>
          <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text">
            <v-icon small>mdi-page-last</v-icon>
          </v-btn>
        </div>
      </div>
    </v-scroll-x-transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import _ from 'lodash';
import TokenRow from './token-row';
import SETTINGS from '@/store/settings';
import { useDisplay } from 'vuetify';

// Setup
const store = useStore();
// const { xs: isXs } = useDisplay();
const breakpoint = useDisplay();
const isXs = breakpoint.xs;

// Reactive State
const items = ref([]);
const page = ref(0);
const filters = ref({
  rowsPerPage: 20,
  sort: 'volume24hr',
  sortAscending: false,
  minVolume: '0',
  minTX: '0',
  search: '',
  showLockedOnly: false,
  excludeStablecoins: true,
});
const loading = ref(false);
const firstLoad = ref(true);
const showSearchLoader = ref(false);
const nextPageExists = ref(false);
const rowCount = ref(0);

// Computed Properties
const sClient = computed(() => store.state.signer);
const reqNetwork = computed(() => store.state.requiredNetwork);
const filtersActive = computed(() => filters.value.showLockedOnly || filters.value.minVolume !== '0' || filters.value.excludeStablecoins);
const pageCount = computed(() => Math.ceil(rowCount.value / filters.value.rowsPerPage));

// Watchers
watch(() => filters.value.search, () => {
  showSearchLoader.value = true;
  page.value = 0;
  normalLoad();
});

watch(filters, () => {
  page.value = 0;
  normalLoad();
}, { deep: true });

// Methods
const disableFilters = () => {
  filters.value.showLockedOnly = false;
  filters.value.minVolume = '0';
  filters.value.excludeStablecoins = false;
};

const sortList = (sorting) => {
  if (filters.value.sort === sorting) {
    filters.value.sortAscending = !filters.value.sortAscending;
  } else {
    filters.value.sort = sorting;
    filters.value.sortAscending = false;
  }
  page.value = 0;
  normalLoad();
};

const normalLoad = _.debounce(async () => {
  const tokens = await APIFetch();
  items.value = tokens;
  rowCount.value = tokens.length;
  const endOfPage = (page.value + 1) * filters.value.rowsPerPage;
  nextPageExists.value = endOfPage < tokens.length;
}, 500, { leading: false });

const nextPage = () => {
  if (page.value + 1 >= pageCount.value) {
    return;
  }
  page.value++;
  normalLoad();
};

const firstPage = () => {
  if (page.value === 0) {
    return;
  }
  page.value = 0;
  normalLoad();
};

const lastPage = () => {
  if (page.value === pageCount.value - 1) {
    return;
  }
  page.value = pageCount.value - 1;
  normalLoad();
};

const previousPage = () => {
  if (page.value <= 0) {
    return;
  }
  page.value--;
  normalLoad();
};

const APIFetch = async () => {
  loading.value = true;

  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].tokenLocker;
  console.log('token fetch...');
  let tokenInfos = [];
  try {
    const msg_tokens = {
      get_tokens: {},
    };
    const tokens = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg_tokens);
    console.log('tokens = ', tokens);

    for (let i = 0; i < tokens.length; i++) {
      const tokenInfoQuery = { token_info: {} };
      let tokenInfo = await sClient.value.client.queryContractSmart(tokens[i], tokenInfoQuery);
      tokenInfo = { ...tokenInfo, address: tokens[i] };
      tokenInfos.push(tokenInfo);
    }
  } catch (err) {
    console.log(err);
  }
  loading.value = false;
  showSearchLoader.value = false;
  firstLoad.value = false;

  console.log('token infos...', tokenInfos);
  return tokenInfos;
};

// Lifecycle Hooks
onMounted(() => {
  normalLoad();
});
</script>
