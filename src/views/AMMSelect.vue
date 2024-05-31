<template>
  <v-container style="max-width: 600px;">
    <v-slide-y-transition appear>
      <div :class="['mb-16', isXs ? '' : 'v-card br-20 foreground']">
        <div class="py-6 title text-center textFaint--text">Select an exchange</div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Uniswap V2')">
          <img :src="getExchangeIcon('Uniswap V2')" height="40px" width="40px" class="mr-3" />
          <div>
            <div class="title">Uniswap V2</div>
            <div class="caption textFaint--text">Ethereum Mainnet</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Sushiswap V1')">
          <img :src="getExchangeIcon('Sushiswap V1')" height="40px" width="40px" class="mr-3 br-20" />
          <div>
            <div class="title">Sushiswap</div>
            <div class="caption textFaint--text">Ethereum Mainnet</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Pancakeswap V2')">
          <img :src="getExchangeIcon('Pancakeswap V2')" height="40px" width="40px" class="mr-3 br-20" />
          <div>
            <div class="title">Pancakeswap V2</div>
            <div class="caption textFaint--text">Binance Smart Chain</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Pancakeswap V1')">
          <img :src="getExchangeIcon('Pancakeswap V1')" height="40px" width="40px" class="mr-3 br-20 greyscale" />
          <div>
            <div class="title">Pancakeswap V1</div>
            <div class="caption textFaint--text">Binance Smart Chain</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Quickswap V1')">
          <img :src="getExchangeIcon('Quickswap V1')" height="40px" width="40px" class="mr-3 br-20" />
          <div>
            <div class="title">Quickswap</div>
            <div class="caption textFaint--text">Matic chain</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Julswap V1')">
          <img :src="getExchangeIcon('Julswap V1')" height="40px" width="40px" class="mr-3 br-20" />
          <div>
            <div class="title">Julswap</div>
            <div class="caption textFaint--text">Binance Smart Chain</div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="() => selectExchange('Honeyswap V1')">
          <img :src="getExchangeIcon('Honeyswap V1')" height="40px" width="40px" class="mr-3" />
          <div>
            <div class="title">Honeyswap</div>
            <div class="caption textFaint--text">xDai chain</div>
          </div>
        </div>

        <div class="textFaint--text py-2 background text-center">Testnets</div>

        <div class="d-flex align-center c-list pa-4" @click="() => selectExchange('Uniswap V2 - Kovan')">
          <img :src="getExchangeIcon('Uniswap V2 - Kovan')" height="40px" width="40px" class="mr-3 greyscale" />
          <div>
            <div class="title">Uniswap V2 - Kovan</div>
            <div class="caption textFaint--text">Kovan Testnet</div>
          </div>
        </div>
      </div>
    </v-slide-y-transition>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import SETTINGS from '@/store/settings';

const store = useStore();
const router = useRouter();

const isXs = computed(() => window.innerWidth < 600);
const getExchangeIcon = (exchange) => {
  return SETTINGS.AMMS[exchange].icon;
};

const selectExchange = (exchange) => {
  store.commit('switchExchange', exchange);
  router.push('/pairs');
};
</script>
