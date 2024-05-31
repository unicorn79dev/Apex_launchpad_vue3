<template>
  <v-bottom-sheet v-model:value="sheet" :overlay-opacity="opacity">
    <v-sheet class="foreground">
      <div class="border-t">
        <token-card @on-close="close" ref="tokenCard"></token-card>
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import TokenCard from './token-card';

// Initialize store
const store = useStore();

// Reactive state
const sheet = ref(false);
const token = ref({});

// Computed properties
const darkMode = computed(() => {
  const theme = store.state.theme;
  return theme === 'theme2' || theme === 'theme3';
});

const opacity = computed(() => (darkMode.value ? 0.8 : 0.3));

// Watchers
watch(sheet, (newValue) => {
  if (!newValue) {
    tokenCardRef.value.stopRefresher();
  }
});

// Methods
const open = (token, network = null, exchange = null) => {
  token.value = token;
  sheet.value = true;
  nextTick(() => {
    tokenCardRef.value.loadToken(token, network, exchange);
  });
};

const close = () => {
  sheet.value = false;
};

// Refs for child components
const tokenCardRef = ref(null);
</script>
