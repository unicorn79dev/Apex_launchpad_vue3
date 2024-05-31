<template>
  <div>
    <div v-if="false" class="title textFaint--text font-weight-bold pa-4">
      {{ $store.state.exchange }} Watchlist <!--<span v-if="uniswapTokenCount"> {{ uniswapTokenCount }} </span> -->
    </div>

    <div v-if="!loggedIn" class="pa-8 text-center">
      <v-icon size="100" color="textFaint">mdi-account-outline</v-icon>
      <div>
        Please log in to access this section
      </div>
      <v-btn x-large outlined block rounded to="/account/social-profile" class="grad-green white--text mt-2">
        LOG IN
      </v-btn>
    </div>
    <div v-else class="mb-16">
      <div v-if="firstLoad" class="text-center pa-12">
        <v-progress-circular indeterminate size="80" width="3" color="#aaa">
          <img :src="require('@/assets/img/APEX.png')" height="60px" width="60px" class="greyscale">
        </v-progress-circular>
      </div>

      <v-scroll-x-transition>
        <div v-if="!firstLoad">
          <div v-if="watchlist.length === 0" class="pa-8 text-center">
            <div class="title">
              No tokens in your {{ $store.state.exchange }} watchlist
            </div>
            <div class="caption mt-2 textFaint--text">
              Add tokens from the 'All tokens' list by clicking on a token and selecting 'Add to watchlist'.
            </div>
          </div>

          <template v-else>
            <div class="d-flex align-center t-small justify-end pr-6">
              <v-btn small rounded outlined @click="complexMode = !complexMode">
                <v-icon v-if="complexMode" small color="primary" class="mr-2">mdi-eye</v-icon>
                <v-icon v-else small class="mr-2">mdi-eye-off</v-icon>
                {{ complexMode ? 'Complex' : 'Simple'}}
              </v-btn>
            </div>

            <div>
              <token-row
                v-for="item in watchlist"
                :key="item.address"
                :item="item"
                :mode="complexMode ? 0 : 1"
              ></token-row>
            </div>
          </template>
        </div>
      </v-scroll-x-transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import TokenRow from './token-row';

// Setup Vuex and Router
const store = useStore();
const route = useRoute();

// Local state
const watchlist = ref([]);
const complexMode = ref(true);
const firstLoad = ref(true);

// Computed properties
const sEthers = computed(() => store.state.ethers);
const loggedIn = computed(() => store.state.user.username);
const watchlistLastUpdated = computed(() => store.state.user.watchlistLastUpdated);

// Watch for changes in watchlistLastUpdated
watch(watchlistLastUpdated, () => {
  fetchWatchlist();
});

// Fetch the watchlist from the server
const fetchWatchlistCall = async () => {
  // Simulate fetching data
  return new Promise((resolve) => {
    setTimeout(() => {
      watchlist.value = [
        { address: '0x1', name: 'Token 1' },
        { address: '0x2', name: 'Token 2' },
      ];
      resolve();
    }, 1000);
  });
};

const fetchWatchlist = async () => {
  try {
    await fetchWatchlistCall();
  } catch (error) {
    console.log(error);
  } finally {
    firstLoad.value = false;
  }
};

// Fetch the watchlist on component mount
onMounted(() => {
  fetchWatchlist();
});

</script>
