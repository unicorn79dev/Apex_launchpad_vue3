<template>
  <v-container style="max-width: 600px; overflow: hidden;" :class="{ 'pa-0': breakpoint.xs }">
    <div :class="[ 'mb-16', { '': breakpoint.xs }, { '': !breakpoint.xs } ]">
      <div v-if="firstLoad" class="text-center">
        <v-progress-circular indeterminate size="80" width="2" color="#aaa">
          <img :src="require('@/assets/img/APEX.png')" height="50px" class="greyscale" width="50px" />
        </v-progress-circular>
      </div>

      <v-scroll-x-transition mode="out-in">
        <div v-if="!firstLoad">
          <div :class="[ { 'v-card br-20 ma-2': breakpoint.xs }, { 'v-card br-20': !breakpoint.xs } ]">
            <div class="text-center">
              <div class="d-flex align-center border-b pa-3">
                <v-btn icon :to="`/browser/tokens`" color="textFaint">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <coin-icon :address="address" :url="token.icon_url" :size="30" class="mr-2"></coin-icon>
                <div class="title pa-0 font-weight-bold" style="min-width: 10px;">
                  <span>{{ tokenHydrated.symbol }}</span>
                </div>
                <span class="textFaint--text ml-2">{{ tokenHydrated.name }}</span>
              </div>
              <div class="background py-2">
                <div>
                  <copy-address :address="address" color="text"></copy-address>
                </div>
                <div class="textFaint--text caption text-center">
                  Total Supply: {{ totalSupplyHuman }}
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex align-center pt-6 pr-4">
            <v-spacer></v-spacer>
            <v-btn rounded small color="primary" :to="`/token?token=${tokenHydrated.address}`" class="green-button">
              Lock tokens
              <v-icon small class="ml-1">mdi-lock-outline</v-icon>
            </v-btn>
          </div>

          <div :class="[ { 'v-card br-20 ma-2': breakpoint.xs }, { 'mt-2 v-card br-20': !breakpoint.xs } ]">
            <global-token :tokenHydrated="tokenHydrated" :isForUser="false"></global-token>
          </div>
        </div>
      </v-scroll-x-transition>
    </div>
  </v-container>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import _ from 'lodash';
import { useStore } from 'vuex';
import GlobalToken from '@/views/locker/erc20/global-token/Main';
import Utils from '@/web3/utils';

import {useDisplay} from 'vuetify';
const breakpoint = useDisplay();

const props = defineProps({
  address: {
    type: String,
    required: true
  }
});

const store = useStore();
const token = ref({ total_supply: '0' });
const tokenHydrated = ref({ address: null });
const firstLoad = ref(true);

const sClient = computed(() => store.state.signer);

const totalSupplyHuman = computed(() => {
  const tsupply = Utils.convertMicroDenomToDenom(token.value.total_supply, token.value.decimals);
  return Number(tsupply).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

const loadAPI = _.debounce(async () => {
  try {
    const tokenInfoQuery = { token_info: {} };
    const tokenInfo = await sClient.value.client.queryContractSmart(props.address, tokenInfoQuery);
    tokenHydrated.value = { ...tokenInfo, address: props.address };
    token.value = tokenInfo;
  } catch (error) {
    console.error(error);
  }
}, 500, { leading: true });

const refresh = async () => {
  await loadAPI();
};

watch(() => sClient.value.watcher, () => {
  refresh();
});

onMounted(async () => {
  await refresh();
  firstLoad.value = false;
});
</script>
