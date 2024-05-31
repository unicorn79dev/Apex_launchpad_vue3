<template>
  <v-container style="max-width: 670px; background-color: #06040c!important; opacity: 0.8;" class=" pt-16 mt-16" >
    <!-- <v-card class="mx-auto" style="border-radius: 4px!important; "> -->
      <!-- <v-btn width="319px" height="50px"  text :color="tab === 0 ? 'primary' : ''" @click="tab = 0"> -->
        <div class="border rounded-lg border-info border-md">
          <v-btn width="317px" height="50px"  text :style="tab === 0 ? 'border-bottom: 2px solid #333355' : ''" @click="tab = 0" >
            <v-icon size="20" class="mr-1">mdi-checkbox-multiple-blank-circle-outline</v-icon>
            <span>Pairs</span>
          </v-btn>
          <v-btn width="317px" height="50px" text :style="tab === 1 ? 'border-bottom: 2px solid #333355' : ''" @click="tab = 1">
            <v-icon size="20" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
            <span>Tokens</span>
          </v-btn>
        </div>
    <!-- </v-card> -->

    <keep-alive>
      <component :is="currentComponent"></component>
    </keep-alive>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import tokensPage from './tokens/Page'
import pairsPage from './pairs/Page'

const tab = ref(0)

const currentComponent = computed(() => {
  if (tab.value === 0) return pairsPage
  if (tab.value === 1) return tokensPage
  return null
})
</script>
