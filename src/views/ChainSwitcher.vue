<template>
  <div>
    <keep-alive include="CronTab,TokensPage,PairsComponent,Presales">
      <router-view :key="$route.fullPath"></router-view>
    </keep-alive>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import SETTINGS from '@/store/settings';

// Props
const props = defineProps({
  chain: {
    type: String
  }
});

// Router and Store
const router = useRouter();
const route = useRoute();
const store = useStore();

// Computed properties
const requiredNetwork = computed(() => store.state.requiredNetwork);

onMounted(() => {
  const shortnames = Object.values(SETTINGS.CHAIN_URL_NAME);
  if (!shortnames.includes(props.chain)) {
    router.replace(`/`);
  } else if (SETTINGS.CHAIN_URL_NAME[requiredNetwork.value] !== props.chain) {
    const requiredChain = Object.keys(SETTINGS.CHAIN_URL_NAME).find(key => SETTINGS.CHAIN_URL_NAME[key] === props.chain);
    store.commit('switchChain', requiredChain);
  }
});

// Watch for changes in the route or requiredNetwork if needed
watch(
  () => requiredNetwork.value,
  (newVal, oldVal) => {
    if (SETTINGS.CHAIN_URL_NAME[newVal] !== props.chain) {
      const requiredChain = Object.keys(SETTINGS.CHAIN_URL_NAME).find(key => SETTINGS.CHAIN_URL_NAME[key] === props.chain);
      store.commit('switchChain', requiredChain);
    }
  }
);
</script>
