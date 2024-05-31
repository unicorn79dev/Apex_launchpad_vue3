<template>
  <v-card class="c-list mb-2 br-20" @click="$emit('on-select')">
    <div class="d-flex align-center pa-3 font-weight-bold">
      <v-spacer></v-spacer>
      {{ tokenAddressCondensed }}
    </div>
  </v-card>
</template>

<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  item: {
    type: String,
    required: true
  }
})

const tokenAddressCondensed = computed(() => {
  const address = props.item
  if (!address) {
    return ''
  }
  return `${address.slice(0, 30)}...${address.slice(-24)}`
})
</script>

<style scoped>
.c-list {
  cursor: pointer;
}
</style>
