<template>
  <div>
    <div class="text-center pt-8">
      <v-icon size="60" color="primary">mdi-lock</v-icon>
    </div>

    <div class="text-center mt-3 mb-8">
      <div class="display-1 primary--text">
        Success!
      </div>
      LP tokens Locked
    </div>

    <div>
      This will be visible within our browser list within 15 mins.
      Thank you for using our locker. Best of luck with your project!
    </div>

    <v-btn block rounded x-large @click="viewLockPage" class="mt-4 white--text grad-green">
      View lock page
    </v-btn>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'
import Utils from '@/web3/utils'

const props = defineProps({
  uniPair: {
    type: String,
    default: null
  },
  lockAmount: {
    type: String,
    default: '0'
  }
})

const router = useRouter()
const store = useStore()
const sClient = computed(() => store.state.signer)

const lockAmountHuman = computed(() => {
  const amount = Utils.convertMicroDenomToDenom(props.lockAmount, 18)
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })
})

const viewLockPage = () => {
  router.replace(`/browser/pair/${props.uniPair}`)
}
</script>
