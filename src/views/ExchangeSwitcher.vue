<!-- <template>
  <v-container style="max-width: 600px; background-color: #06040c!important; opacity: 0.8;" class=" pt-16 mt-8" >
        <div class="rounded-lg" style="border:1px solid #4a4865;">
          <v-btn width="280px" height="50px" style="background-color: #002; opacity: 0.8;"  text :style="tab === 0 ? 'border-bottom: 3px solid #aaaaff;' : ''" @click="tab = 0" >
            <v-icon size="20" class="mr-1">mdi-checkbox-multiple-blank-circle-outline</v-icon>
            <span>Pairs</span>
          </v-btn>
          <v-btn width="280px" height="50px" style="background-color: #002; opacity: 0.8;" text :style="tab === 1 ? 'border-bottom: 3px solid #aaaaff' : ''" @click="tab = 1">
            <v-icon size="20" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
            <span>Tokens</span>
          </v-btn>
        </div>

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
</script> -->

<template>
  <div class="pt-16 mt-8">
    <v-slide-y-transition appear>
      <div>
        <div class="justify-center mx-auto" style="max-width: 580px;">

          <div class="d-flex  br-8 mt-3" style="overflow: hidden;background-color: #060415;border: 1px solid #335;">
            <router-link 
            :to="`/browser/pairs`"
            v-slot="{ isActive, navigate }" custom>
              <div :class="['top-tab', {'active': isActive}]" @click="navigate"  :style="isActive?'border-bottom: 1px solid #554399;':''">
                <v-icon size="20" class="mr-1">mdi-checkbox-multiple-blank-circle-outline</v-icon>
                <span>Pairs</span>
              </div>
            </router-link>

            <router-link 
            :to="`/browser/tokens`"
            v-slot="{ isActive, navigate }" custom>
              <div :class="['top-tab', {'active': isActive}]" @click="navigate" :style="isActive?'border-bottom: 1px solid #554399;':''">
                <v-icon size="20" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
                <span>Tokens</span>
              </div>
            </router-link>
            
          </div>

        </div>

        <keep-alive include="CronTab,TokensPage,PairsComponent,Presales">
          <router-view :key="$route.fullPath"></router-view>
        </keep-alive>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>

export default {
  data: () => ({
  }),

  created () {
  }
}
</script>