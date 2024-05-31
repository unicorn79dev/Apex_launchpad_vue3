<template>
  <token-mobile v-if="isXs" ref="tokenMobile"></token-mobile>
  <token-desktop v-else ref="tokenDesktop"></token-desktop>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import TokenMobile from './bottom-sheet';
import TokenDesktop from './token-dialog';

// Setup Vuex store
const store = useStore();

// Use Vuetify's useDisplay composable
const breakpoint = useDisplay();
// const { xs } = useDisplay();
const isXs = computed(() => breakpoint.xs.value);

// Refs for child components
const tokenMobileRef = ref(null);
const tokenDesktopRef = ref(null);

// Methods
const open = (token, network = null, exchange = null) => {
  if (isXs.value) {
    tokenMobileRef.value.open(token, network, exchange);
  } else {
    tokenDesktopRef.value.open(token, network, exchange);
  }
};

const close = () => {
  if (isXs.value) {
    tokenMobileRef.value.close();
  } else {
    tokenDesktopRef.value.close();
  }
};
</script>
