<template>
  <v-container style="max-width: 600px;">
    <v-slide-x-transition appear>
      <div :class="['mb-16', isXs ? 'pa-4 foreground v-card br-20' : 'pa-6 v-card br-20 foreground']">
        <div class="text-center">
          <img src="@/assets/img/icons/rocket.svg" height="60px" width="60px">
        </div>
        <div class="title text-center textFaint--text">
          Launchpad
        </div>
        <div class="text-center py-2 mb-5">
          <div class="textFaint--text">
            Selected network
          </div>
          <v-btn large block outlined @click="$root.$dialog.chainSwitcher.open()" class="title">
            <img :src="$settings.CHAINS[$store.state.requiredNetwork].icon" height="24px" width="24px" class="mr-3 br-20">
            {{ $settings.CHAIN_DISPLAY_NAME[$store.state.requiredNetwork] }}
            <v-icon small>mdi-chevron-down</v-icon>
          </v-btn>
        </div>
        <div class="text-center mb-2">
          Launch your token on which exchange?
        </div>
        <div v-for="amm in amms" :key="amm" class="v-card d-flex align-center title c-list pa-4 br-20 mb-2" @click="selectExchange(amm)">
          <img :src="$settings.AMMS[amm].icon" height="40px" width="40px" class="mr-3 br-20">
          <div>
            <div class="title">
              {{ amm }}
            </div>
            <div class="caption textFaint--text">
              {{ $settings.CHAIN_DISPLAY_NAME[$store.state.requiredNetwork] }}
            </div>
          </div>
        </div>
      </div>
    </v-slide-x-transition>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const amms = ref([])

const requiredNetwork = computed(() => store.state.requiredNetwork)
const isXs = ref(window.innerWidth < 600)

const handleResize = () => {
  isXs.value = window.innerWidth < 600
}

const selectExchange = (exchange) => {
  store.commit('switchExchange', exchange)
  this.$root.ammLink(`/ilo/create`)
}

const refresh = () => {
  amms.value = Object.keys($settings.AMMS).filter(key => $settings.AMMS[key].chain === store.state.requiredNetwork)
}

watch(requiredNetwork, refresh)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  refresh()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.foreground {
  background: #fff;
}
.c-list {
  cursor: pointer;
}
</style>
