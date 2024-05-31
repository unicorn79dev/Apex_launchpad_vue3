<template>
  <v-container style="max-width: 600px;padding: 10px;" class="pt-16 mt-8">
    <v-card v-if="$store.state.exchange === 'Uniswap'" class="pa-4 br-20 mb-2" >
      <div class="caption font-weight-medium">
        We now offer Yield Farming services to virtually any ERC20 token on our all-inclusive yield farming dApp.
        Boost your pairs liquidity and reward your community for providing liquidity today!
      </div>
      <div class="d-flex mt-2">
        <v-btn small href="https://farm.unicrypt.network/" target="_blank" rounded outlined class="mr-2">
          <v-icon small class="mr-2">mdi-sprout-outline</v-icon>
          Yield Farming dApp
        </v-btn>
      </div>
    </v-card>

    <div class=" br-12" style="background-color: #001; opacity: 0.8;border:1px solid #338;">
      <v-btn height="50px"  text :style="tab === 0 ? 'color:#aca1fc; font-size:16px' : ''"  @click="tab = 0" class="rounded-s-xl">
        <v-icon size="20" class="mr-1">mdi-checkbox-multiple-blank-circle-outline</v-icon>
        <span>New Lock</span>
      </v-btn>
      <v-btn height="50px"   text :style="tab === 1 ? 'color:#aca1fc; font-size:16px' : ''"@click="tab = 1">
        <v-icon size="20" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
        <span>Edit / Withdraw</span>
      </v-btn>
    </div>

    <keep-alive>
      <component :is="currentComponent"></component>
    </keep-alive>
  </v-container>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import LockPage from './LockPage'
import WithdrawPage from './withdraw/WithdrawPage'
import InfoPage from './info-page.vue'




const tab = ref(0)

const currentComponent = computed(() => {
  if (tab.value === 0) return LockPage
  if (tab.value === 1) return WithdrawPage
  if (tab.value === 2) return InfoPage
  return null
})
</script>
