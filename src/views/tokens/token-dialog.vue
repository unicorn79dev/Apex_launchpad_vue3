<template>
  <v-dialog v-model="dialog" max-width="450" content-class="br-20">
    <v-card class="foreground">
      <token-card @on-close="close" ref="tokenCard"></token-card>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import TokenCard from './token-card';

// Reactive data
const dialog = ref(false);
const token = ref({});

// Refs for child components
const tokenCardRef = ref(null);

// Watchers
watch(dialog, (newValue) => {
  if (!newValue) {
    tokenCardRef.value.stopRefresher();
  }
});

// Methods
const open = (newToken, network = null, exchange = null) => {
  token.value = newToken;
  dialog.value = true;
  nextTick(() => {
    tokenCardRef.value.loadToken(newToken, network, exchange);
  });
};

const close = () => {
  dialog.value = false;
};
</script>
