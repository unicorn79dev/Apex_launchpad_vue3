<template>
  <div>
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate size="80" color="textFaint">
        <v-icon size="60" color="textFaint">mdi-lock-outline</v-icon>
      </v-progress-circular>
    </div>
    <template v-else>
      <locked-pair-row
        v-for="token in usersLockedTokens"
        :key="token.address"
        :item="token"
        @on-select="$emit('on-select', token)"
      ></locked-pair-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import LockedPairRow from './locked-pairs-row'
import SETTINGS from '@/store/settings'

// Remove TypeScript interface
// Define LockedToken type as an object if needed

const loading = ref(true)
const usersLockedTokens = ref([])
const store = useStore()

const sClient = computed(() => store.state.signer)
const reqNetwork = computed(() => store.state.requiredNetwork)

const getLockedTokens = async () => {
  console.log('GET LOCKED TOKENS')
  const msg1 = {
    get_user_num_locked_tokens: {
      user: sClient.value.address,
    },
  }

  console.log('MSG 1 = ', msg1)
  console.log('R_Client = ', sClient.value.client)
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  console.log('Contract Address = ', CONTRACT_ADDRESS)

  try {
    const numTokens = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg1)
    console.log('NUM_TOKENS', numTokens)
    const tokens = []
    for (let i = 0; i < numTokens; i++) {
      const msg2 = {
        get_user_locked_token_at_index: {
          user: sClient.value.address,
          index: i,
        },
      }
      const address = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg2)
      const token = address
      tokens.push(token)
    }
    usersLockedTokens.value = tokens
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getLockedTokens()
})
</script>
