<template>
  <v-container style="max-width: 600px;">
    <v-slide-x-transition appear>
      <div :class="['br-20 mb-16', { 'pa-4': isXs }, { 'pa-6': !isXs }]">
        <div class="mb-3 title text-center textFaint--text">Select Network</div>

        <div class="v-card d-flex align-center c-list pa-4 br-20 mb-2" @click="selectChain('Mainnet')">
          <img :src="$settings.CHAINS['Mainnet'].icon" height="40px" width="40px" class="mr-3">
          <div>
            <div class="title">Ethereum mainnet</div>
          </div>
        </div>

        <div class="v-card d-flex align-center c-list pa-4 br-20 mb-2" @click="selectChain('BSC_MAINNET')">
          <img :src="$settings.CHAINS['BSC_MAINNET'].icon" height="40px" width="40px" class="mr-3">
          <div>
            <div class="title">Binance Smart Chain</div>
          </div>
        </div>
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script setup>
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';

// Use Vuex store and Vue Router
const store = useStore();
const router = useRouter();
const route = useRoute();

// Computed property to detect if the screen width is extra small
const isXs = ref(window.innerWidth < 600);

// Function to handle resize events
const handleResize = () => {
  isXs.value = window.innerWidth < 600;
};

// Add event listener for resize events
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Access settings from the store
const $settings = computed(() => store.state.settings);

// Method to handle chain selection
const selectChain = (requiredChain) => {
  store.commit('switchChain', requiredChain);
  if (route.query.redirect === 'locker') {
    router.push(`${store.state.chainPrefix}/locker`);
  } else if (route.query.redirect === 'minter') {
    router.push(`${store.state.chainPrefix}/minter`);
  } else {
    router.push('/dashboard');
  }
};
</script>
