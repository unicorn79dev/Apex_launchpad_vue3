<template>
  <div v-if="amountRemaining !== '0' && !epochHasPassed" class="border-b">
    <!-- Content -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import moment from 'moment';
import LinearLockChart from '@/views/locker/erc20/charts/linear-lock';

const expandInfo = ref(false);

const condensedAddress = computed(() => {
  const address = props.item.owner;
  return address ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}` : '';
});

const unlockProgress = computed(() => {
  const now = moment().unix();
  return ((props.item.end_emission - now) * 100) / 10368000; // 4 months
});

const isLinearLock = computed(() => {
  return props.item.start_emission !== 0;
});

const iconType = computed(() => {
  if (amountRemaining.value === '0') return 'mdi-check-circle-outline';
  if (epochHasPassed.value) return 'mdi-lock-open-outline';
  return 'mdi-lock';
});

const iconColor = computed(() => {
  if (amountRemaining.value === '0' || epochHasPassed.value) return 'textFaint';
  return 'primary';
});

const iconTextClass = computed(() => {
  if (amountRemaining.value === '0' || epochHasPassed.value) return 'textFaint--text';
  return 'primary--text';
});

const displayAmount = computed(() => {
  return $root.formatAmount(amountRemaining.value, props.tokenHydrated.decimals);
});

const progressColor = computed(() => {
  return unlockProgress.value >= 20 ? 'primary' : 'primary';
});

const chevronClass = computed(() => {
  return { 'rotate-180': expandInfo.value };
});

const menuButtonColor = computed(() => {
  return sClient.address === props.item.owner ? 'primary' : 'textFaint';
});

const isOwner = computed(() => {
  return sClient.address === props.item.owner;
});

const epochHasPassed = computed(() => {
  return props.item.end_emission < moment().unix();
});

const amountRemaining = computed(() => {
  return (props.item.tokens_deposited - props.item.tokens_withdrawn).toString();
});

const toggleExpandInfo = () => {
  expandInfo.value = !expandInfo.value;
};

watch(() => props.item, () => {
  // Handle item change if needed
});

</script>
