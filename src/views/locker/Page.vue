<template>
  <v-container :class="containerClass" style="max-width: 600px;">
    <v-slide-x-transition appear>
      <v-card :class="cardClass">
        <div class="d-flex align-center mb-6">
          <div class="display-1 font-weight-bold">Locker</div>
        </div>
        <div class="text-center title textFaint--text mb-4">Which tokens would you like to lock?</div>
        <v-row dense class="title text-center">
          <v-col cols="6">
            <v-card class="pa-6 br-8 c-list" :to="`${chainPrefix}/locker/erc20`">ERC20 tokens</v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 br-8 c-list" :to="`${chainPrefix}/locker/amm`">Liquidity tokens</v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-slide-x-transition>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const chainPrefix = computed(() => store.state.chainPrefix);

// Reactive property to detect if the screen width is extra small
const isXs = ref(window.innerWidth < 600);

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

const containerClass = computed(() => ({
  'pa-0 foreground mobile-page': isXs.value,
}));

const cardClass = computed(() => ({
  'br-20': true,
  'pa-4': isXs.value,
  'pa-6': !isXs.value,
}));
</script>

<style scoped>
.foreground {
  background: #fff;
}

.mobile-page {
  max-width: 100vw;
}

.c-list {
  cursor: pointer;
}
</style>
