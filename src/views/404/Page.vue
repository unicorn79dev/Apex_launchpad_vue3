<template>
  <v-container style="max-width: 600px;">
    <v-card :class="cardClasses">
      <div class="d-flex align-center mb-6">
        <v-btn icon to="/" color="text">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <div class="display-1">
          Page not found
        </div>
        <v-spacer></v-spacer>
        <div style="width: 32px;"></div>
      </div>
      <div>
        Looks like this page cannot be found!
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isXs = ref(window.innerWidth < 600);

const handleResize = () => {
  isXs.value = window.innerWidth < 600;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const cardClasses = computed(() => ({
  'br-20': true,
  'pa-4': isXs.value,
  'pa-6': !isXs.value,
}));
</script>

<style scoped>
/* Scoped styles */
</style>
