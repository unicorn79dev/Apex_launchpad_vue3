<template>
  <div class="mt-16 pt-8" >
  <v-container class="px-0" style="max-width: 600px; background-color: #0a0a1a!important; opacity: 0.87; border-radius: 5%; border-bottom: 0.5px solid #333;">
    <v-slide-y-transition appear>
      <!-- <div :class="['mb-16', isXs ? 'foreground v-card br-20' : 'v-card br-20 foreground']"> -->
      <div>
        <div class="py-6 title text-center" style="color: #fff;font-size:20px;">
          Our CW20 Lockers
        </div>
        
        <router-link to="/liquidity" v-slot="{ navigate }" style="text-decoration: none; color: white;">
          <div class="d-flex align-center c-list pa-4 border-b" @click="navigate">
            <img :src="require('@/assets/img/icons/padlock.svg')" height="60px" width="60px" class="mr-3 greyscale">
            <div>
              <div class="">
                Liquidity Locker
              </div>
              <div class="caption textFaint--text" style="font-size:x-small; color: #aaa;">
                Lock Liquidity tokens
              </div>
            </div>
          </div>
        </router-link>

        <router-link to="/token" v-slot="{ navigate }" style="text-decoration: none; color: white;">
          <div class="d-flex align-center c-list pa-4" @click="navigate">
            <img :src="require('@/assets/img/icons/padlock.svg')" height="60px" width="60px" class="mr-3 greyscale">
            <div>
              <div class="">
                Token Locker
              </div>
              <div class="caption textFaint--text" style="font-size:x-small; color: #aaa;">
                Lock your CW20 tokens
              </div>
              <div class="caption textFaint--text" style="font-size:x-small; color: #aaa;">
                Send locked tokens to someone else for a configurable period
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </v-slide-y-transition>
  </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isXs = ref(window.innerWidth < 600)

const handleResize = () => {
  isXs.value = window.innerWidth < 600
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.foreground {
  background: #fff;
}
</style>
