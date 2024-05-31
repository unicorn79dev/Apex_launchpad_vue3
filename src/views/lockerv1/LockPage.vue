<template>
  <v-container :class="['br-20', isXs ? 'pa-4' : 'pa-8']" style=" background-color: #0a0815!important;border:1px solid #335;" class="rounded-xl mt-2">

    <v-btn v-if="stage > 0" text @click="previousStage" class="mb-4 pa-0">
      <v-icon>mdi-arrow-left</v-icon>
      Back
    </v-btn>

    <one-select-pair v-if="stage === 0" @on-continue="continueOne"></one-select-pair>
    <two-lock v-if="stage === 1" :uniPair="uniPair" @on-lock="onLock"></two-lock>
    <three-success v-if="stage === 2" :uniPair="uniPair" :lockAmount="lockAmount"></three-success>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import OneSelectPair from './one-select-pair';
import TwoLock from './two-lock';
import ThreeSuccess from './three-success';

const stage = ref(0);
const uniPair = ref({});
const lockAmount = ref('0');

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

const continueOne = (pair) => {
  uniPair.value = pair;
  stage.value = 1;
};

const onLock = (amount) => {
  lockAmount.value = amount;
  stage.value = 2;
};

const previousStage = () => {
  if (stage.value > 0) {
    stage.value--;
  }
};
</script>
