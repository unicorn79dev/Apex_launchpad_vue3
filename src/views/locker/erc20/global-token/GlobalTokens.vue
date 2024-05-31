<template>
  <div class="">
    <div class="">
      <div class="background d-flex align-center px-4">
        <div v-if="!firstLoad" class="textFaint--text font-italic caption">
          {{ numTokens }} {{ numTokens === 1 ? 'token' : 'tokens'}}
        </div>
        <v-spacer></v-spacer>

        <v-btn v-if="!loading" @click="refresh" icon color="textFaint">
          <v-icon small>mdi-refresh</v-icon>
        </v-btn>
        <div v-else style="height: 36px; width: 36px;" class="d-flex align-center justify-center">
          <v-progress-circular
          indeterminate
          size="14"
          width="2"
          color="primary">
          </v-progress-circular>
        </div>
      </div>

      <div v-if="firstLoad" class="text-center textFaint--text py-4">
        Loading...
      </div>

      <v-slide-y-transition appear>
        <div v-if="!firstLoad">
          <template v-if="tokens.length > 0">
            <div 
            v-for="token of tokens" 
            :key="token.address" 
            :class="['d-flex align-center pa-3 border-b c-list']" 
            @click="$root.tokenPage.open(token.address, chain)">
              <coin-icon :address="token.address" :network="chain" class="mr-3"></coin-icon>
              {{ token.symbol }}
              <v-spacer></v-spacer>
              <enmt-badge v-if="token.isENMT"></enmt-badge>
            </div>

            <div v-if="pageCount > 1" class="d-flex align-center justify-center background pa-2">
              <v-btn @click="goPrevious" text :disabled="page === 0">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              {{ page + 1 }} / {{ pageCount }}
              <v-btn @click="goNext" text :disabled="!nextPageExists">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </template>

          <div v-else class="caption pa-8 text-center textFaint--text">
            No Token locks found on this chain
          </div>
        </div>
      </v-slide-y-transition>
    </div>
  </div>
</template>
<script>
import { ref, computed, watch, onMounted } from 'vue';
import VestingPager from '@/smart-contracts/token-locker/pager-contract';
import ERC20 from '@/smart-contracts/erc20/pager';

export default {
  props: {
    chain: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const numTokens = ref(0);
    const tokens = ref([]);
    const page = ref(0);
    const firstLoad = ref(true);
    const loading = ref(true);
    const rowsPerPage = ref(3);

    const sEthers = computed(() => store.state.ethers);
    const sEthersWatcher = computed(() => sEthers.value.watcher);

    const nextPageExists = computed(() => (page.value + 1) * rowsPerPage.value < numTokens.value);
    const pageCount = computed(() => Math.ceil(numTokens.value / rowsPerPage.value));

    watch(() => props.chain, () => refresh());
    watch(sEthersWatcher, () => refresh());

    const goNext = () => {
      page.value++;
      refresh();
    };

    const goPrevious = () => {
      page.value--;
      refresh();
    };

    const getLockedTokens = async (_start, _count) => {
      return await VestingPager.getLockedTokens(_start, _count, props.chain);
    };

    const getNumLockedTokens = async () => {
      const num = await VestingPager.getNumLockedTokens(props.chain);
      numTokens.value = Number(num);
    };

    const refresh = async () => {
      loading.value = true;
      try {
        await getNumLockedTokens();
        let startIndex = numTokens.value - ((page.value * rowsPerPage.value) + rowsPerPage.value);
        let fetchCount = rowsPerPage.value;
        if (startIndex < 0) {
          fetchCount += startIndex;
          startIndex = 0;
        }
        let addresses = await getLockedTokens(startIndex, fetchCount);
        addresses = Object.values(addresses).reverse();
        const tokenList = [];
        for (let address of addresses) {
          const token = await ERC20.getERC20(address, props.chain);
          tokenList.push(token);
        }
        tokens.value = tokenList;
        firstLoad.value = false;
        loading.value = false;
      } catch (e) {
        firstLoad.value = false;
        loading.value = false;
      }
    };

    onMounted(() => {
      refresh();
    });

    return {
      numTokens,
      tokens,
      page,
      firstLoad,
      loading,
      rowsPerPage,
      sEthers,
      sEthersWatcher,
      nextPageExists,
      pageCount,
      goNext,
      goPrevious,
      refresh
    };
  }
};
</script>
<style scoped>
.textFaint--text {
  color: #aaa;
}

.font-italic {
  font-style: italic;
}

.caption {
  font-size: 0.75rem;
}

.pa-8 {
  padding: 2rem;
}

.pa-3 {
  padding: 0.75rem;
}

.pa-2 {
  padding: 0.5rem;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.background {
  background-color: #f5f5f5;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.c-list {
  cursor: pointer;
}

.v-spacer {
  flex: 1 1 auto;
}
</style>

