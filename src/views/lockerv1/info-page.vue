<template>
  <v-card class="br-20 pa-4">
    <div class="d-flex align-center mb-8 display-1">
      Explorer
      <v-spacer></v-spacer>
      <v-icon size="50">mdi-lock</v-icon>
    </div>

    <v-card v-for="token in tokens" :key="token.lptoken" class="pa-3 br-20">
      <div class="font-weight-bold mb-3">
        {{ token.lptoken }}
      </div>
      <div v-for="lock in token.locks" :key="lock.lockID">
        <info-row :lock="lock"></info-row>
      </div>
    </v-card>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import InfoRow from './info-row'
import LockerContract from '@/smart-contracts/lock-uni-v2/univ2-contract'

const tokens = ref([])

const getLockedTokens = async () => {
  const numTokens = await LockerContract.getNumLockedTokens()
  const tokenPromises = Array.from({ length: numTokens }).map(async (_, i) => {
    const token = await LockerContract.getLockedTokenAtIndex(i)
    const locks = await getLocks(token)
    return {
      lptoken: token,
      locks: locks
    }
  })
  tokens.value = await Promise.all(tokenPromises)
}

const getLocks = async (_lpToken) => {
  const numLocks = await LockerContract.getNumLocksForToken(_lpToken)
  const lockPromises = Array.from({ length: numLocks }).map(async (_, i) => {
    console.log(i + ' of ' + numLocks)
    const lock = await LockerContract.getLockForTokenAtIndex(_lpToken, i)
    return lock
  })
  return Promise.all(lockPromises)
}

onMounted(() => {
  getLockedTokens()
})
</script>
