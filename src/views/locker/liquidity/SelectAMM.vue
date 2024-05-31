<template>
  <v-container style="max-width: 600px;">
    <v-slide-x-transition appear>
      <div :class="['mb-16 pa-4', isXs ? 'foreground v-card br-20' : 'v-card br-20 foreground']">
        <div class="text-center">
          <img :src="require('@/assets/img/icons/padlock.svg')" height="60px" width="60px" class="greyscale">
        </div>

        <div class="title text-center textFaint--text">
          Liquidity Locker
        </div>

        <div class="text-center py-2 mb-5">
          <div class="textFaint--text">
            Selected network
          </div>
          <v-btn large block outlined @click="openChainSwitcher" class="title">
            <img 
              :src="$settings.CHAINS[requiredNetwork].icon" 
              height="24px"
              width="24px"
              class="mr-3 br-20">
            {{ $settings.CHAIN_DISPLAY_NAME[requiredNetwork] }}
            <v-icon small>mdi-chevron-down</v-icon>
          </v-btn>
        </div>

        <div class="text-center mb-2">
          Lock Liquidity on which exchange?
        </div>

        <div v-for="amm in amms" :key="amm" class="v-card d-flex align-center title c-list pa-4 br-20 mb-2" @click="selectExchange(amm)">
          <img 
            :src="$settings.AMMS[amm].icon" 
            height="40px"
            width="40px"
            class="mr-3 br-20">
          <div>
            <div class="title">{{ amm }}</div>
            <div class="caption textFaint--text">{{ $settings.CHAIN_DISPLAY_NAME[requiredNetwork] }}</div>
          </div>
        </div>
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const amms = ref<string[]>([]);

const requiredNetwork = computed(() => store.state.requiredNetwork);
const isXs = ref(window.innerWidth < 600);

const handleResize = () => {
  isXs.value = window.innerWidth < 600;
};

// Add event listener for resize events
onMounted(() => {
  window.addEventListener('resize', handleResize);
  refresh();
});

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const refresh = () => {
  amms.value = Object.keys(store.state.settings.AMMS).filter(key => store.state.settings.AMMS[key].chain === store.state.requiredNetwork);
};

watch(requiredNetwork, refresh);

const selectExchange = (exchange: string) => {
  store.commit('switchExchange', exchange);
  store.$router.push('/locker');
};

const openChainSwitcher = () => {
  store.$root.$dialog.chainSwitcher.open();
};

refresh();
</script>

<style scoped>
.foreground {
  background: #fff;
}
.c-list {
  cursor: pointer;
}
</style>
