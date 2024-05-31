<template>
  <div style="height: 200px;margin-top: 10px; background-color: #0a0815!important; border:1px solid #333" class="rounded-xl">
    <v-btn v-if="stage > 0" text @click="previousStage" class="mb-4 pa-0">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <one-select-pair v-if="stage === 0" @on-continue="continueOne"></one-select-pair>
    <two-withdraw v-if="stage === 1" :uniPair="uniPair"></two-withdraw>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import OneSelectPair from './one-select-pair';
import TwoWithdraw from './two-withdraw';

const stage = ref(0);
const uniPair = ref({});

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

const continueOne = (selectedUniPair) => {
  uniPair.value = selectedUniPair;
  stage.value = 1;
};

const previousStage = () => {
  if (stage.value > 0) {
    stage.value--;
  }
};
</script>
