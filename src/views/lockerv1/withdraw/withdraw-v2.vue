<!-- <template>
  <div>
    <div v-if="loading.value" class="text-center mt-6">
      <v-progress-circular indeterminate size="80" color="textFaint">
        <v-icon size="60" color="textFaint">mdi-lock-outline</v-icon>
      </v-progress-circular>
    </div>
    <v-scroll-x-transition>
      <div v-if="!loading.value">
        <div class="display-1 textFaint--text font-weight-bold mb-7 ml-8" style="font-size: 38px; color:#aaa">
          Withdraw liquidity
        </div>
        <div class="pa-4 mb-2 text-center">
          <copy-address :address="uniPair" color="textFaint"></copy-address>
        </div>
        <div class="mt-8">
          <deposit-row
            v-for="lock in locks.value"
            :key="lock.lockID"
            :item="lock"
            :totalSupply="tokenInfo.value.total_supply"
            @withdraw="withdraw"
            @migrate="migrate"
            @relock="relock"
            @transfer-ownership="transferOwnership"
            @increment="increment"
            @split="split"
          ></deposit-row>
        </div>
        <div v-if="locks.value.length === 0">
          <div class="ml-8">
            No locks for this account
          </div>
        </div>
        <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>
        <relock-dialog ref="relockDialog"></relock-dialog>
        <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>
        <migrate-dialog ref="migrateDialog"></migrate-dialog>
        <increment-dialog ref="incrementDialog"></increment-dialog>
        <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>
      </div>
    </v-scroll-x-transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import DepositRow from './deposit-row-v2'
import WithdrawDialog from './withdraw-v2-dialog'
import MigrateDialog from './migrate-dialog'
import IncrementDialog from './increment-dialog'
import RelockDialog from './relock-dialog'
import SplitLockDialog from './split-lock-dialog'
import TransferOwnershipDialog from './transfer-ownership-dialog'
import SETTINGS from '@/store/settings'

import { useStore } from 'vuex'

const props = defineProps({
  uniPair: String,
})

const loading = ref(true)
const locks = ref([])
const tokenInfo = ref({})

const sClient = computed(() => useStore().state.signer)
const reqNetwork = computed(() => useStore().state.requiredNetwork)
const sClientWatcher = computed(() => sClient.value.watcher)

const getLocks = async () => {
  await getTokenInfo()
  const msg1 = {
    get_user_num_locks_for_token: {
      user: sClient.value.address,
      lptoken: props.uniPair,
    },
  }
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork.value].lpLocker
  try {
    const numTokens = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg1)
    const locksArray = []
    for (let i = 0; i < numTokens; i++) {
      const msg2 = {
        get_user_lock_for_token_at_index: {
          user: sClient.value.address,
          lptoken: props.uniPair,
          index: i,
        },
      }
      let token = await sClient.value.client.queryContractSmart(CONTRACT_ADDRESS, msg2)
      token = { ...token, user_lock_index: i }
      locksArray.push(token)
    }
    locksArray.sort((a, b) => a.unlock_date - b.unlock_date)
    locks.value = locksArray
  } catch (err) {
    console.error(err)
  }
}

const getTokenInfo = async () => {
  const tokenInfoQuery = { token_info: {} }
  const info = await sClient.value.client.queryContractSmart(props.uniPair, tokenInfoQuery)
  tokenInfo.value = info
}

const withdraw = (item) => {
  refs.withdrawDialog.open(item, props.uniPair)
}

const transferOwnership = (item) => {
  refs.transferOwnershipDialog.open(item, props.uniPair)
}

const relock = (item) => {
  refs.relockDialog.open(item, props.uniPair)
}

const migrate = (item) => {
  refs.migrateDialog.open(item, props.uniPair)
}

const increment = (item) => {
  refs.incrementDialog.open(item, props.uniPair)
}

const split = (item) => {
  refs.splitLockDialog.open(item, props.uniPair)
}

const loadUserLocks = (setLoading) => {
  if (setLoading) {
    loading.value = true
  }
  getLocks()
    .then(() => {
    })
    .catch((e) => console.error(e))
    .finally(() => {
      loading.value = false
    })
}

watch(sClientWatcher, () => {
  loadUserLocks(true)
})

onMounted(() => {
  loadUserLocks(true)
})
</script> -->



<template>
  <div>

    <div v-if="loading" class="text-center mt-6">
      <v-progress-circular
      indeterminate
      size="80"
      color="textFaint">
        <v-icon size="60" color="textFaint">mdi-lock-outline</v-icon>
      </v-progress-circular>
    </div>
    <v-scroll-x-transition>
      <div v-if="!loading">

        <div class="display-1 textFaint--text font-weight-bold mb-7">
          Withdraw liquidity
        </div>

        <div class="pa-4 mb-2 text-center">
          <copy-address :address="uniPair" color="textFaint"></copy-address>
        </div>

        <div class="mt-8">
          <deposit-row v-for="lock of locks" :key="lock.lockID" :item="lock" :totalSupply="tokenInfo.total_supply" 
          @withdraw="withdraw" @migrate="migrate" @relock="relock" @transfer-ownership="transferOwnership" 
          @increment="increment" @split="split">
          </deposit-row>
        </div>

        <div v-if="locks.length === 0">
          No locks for this account
        </div>

        <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>

        <relock-dialog ref="relockDialog"></relock-dialog>

        <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>

        <migrate-dialog ref="migrateDialog"></migrate-dialog>

        <increment-dialog ref="incrementDialog"></increment-dialog>

        <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>

      </div>
    </v-scroll-x-transition>

  </div>
</template>

<script>
import DepositRow from './deposit-row-v2'
import WithdrawDialog from './withdraw-v2-dialog'
import MigrateDialog from './migrate-dialog'
import IncrementDialog from './increment-dialog'
import RelockDialog from './relock-dialog'
import SplitLockDialog from './split-lock-dialog'
import TransferOwnershipDialog from './transfer-ownership-dialog'
import CopyAddress from '@/components/ui/copy-address'

import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  props: {
    uniPair: String
  },

  components: {
    DepositRow,
    WithdrawDialog,
    MigrateDialog,
    RelockDialog,
    TransferOwnershipDialog,
    IncrementDialog,
    SplitLockDialog,
    CopyAddress
  },

  data: () => ({
    loading: true,
    locks: [], // {'lockID': 1},{'lockID': 2}
    tokenInfo: {}
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    sClientWatcher () {
      return this.sClient.watcher
    },
  },

  watch: {
    sClientWatcher () {
      this.loadUserLocks(true)
    },
  },

  methods: {
    async getLocks () {
      await this.getTokenInfo()

      console.log("GET LOCKS")
      const msg1 = {
        "get_user_num_locks_for_token": {
          "user": this.sClient.address,
          "lptoken": this.uniPair,
        },
      }
      
      console.log("MSG 1 = ", msg1)
      console.log("R_Client = ", this.sClient.client)
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
      console.log("Contract Address = ", CONTRACT_ADDRESS)
      try {
        var numTokens = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg1)

        console.log("Number of tokens = ", numTokens)
        var locks = []
        for (var i = 0; i < numTokens; i++) {
          const msg2 = {
            "get_user_lock_for_token_at_index": {
              "user": this.sClient.address,
              "lptoken": this.uniPair,
              "index": i,
            }
          }
          var token = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg2)
          token = {
            ...token,
            "user_lock_index": i
          }
          console.log("TOKEN", token)
          locks.push(token)
        }
        locks.sort((a,b) => a.unlock_date - b.unlock_date)
        this.locks = locks
      } catch (err) {
        console.log(err)
      }

      console.log("Locks = ", locks)
    },
    async getTokenInfo () {
      console.log("GET TOKEN INFO")
      const tokenInfoQuery = { token_info: {} }
      console.log("uniPair = ", this.uniPair)
      const tokenInfo = await this.sClient.client.queryContractSmart(this.uniPair, tokenInfoQuery)
      console.log("Token Info = ", tokenInfo)
      this.tokenInfo = tokenInfo
    },
    withdraw (item) {
      this.$refs.withdrawDialog.open(item, this.uniPair)
    },
    transferOwnership (item) {
      this.$refs.transferOwnershipDialog.open(item, this.uniPair)
    },
    relock (item) {
      this.$refs.relockDialog.open(item, this.uniPair)
    },
    migrate (item) {
      this.$refs.migrateDialog.open(item, this.uniPair)
    },
    increment (item) {
      this.$refs.incrementDialog.open(item, this.uniPair)
    },
    split (item) {
      this.$refs.splitLockDialog.open(item, this.uniPair)
    },
    loadUserLocks (setLoading) {
      if (setLoading) {
        this.loading = true
      }
      this.getLocks()
        .then(() => {
        })
        .catch(e => {})
        .then(() => {
          this.loading = false
        })
    }
  },

  created () {
    this.loadUserLocks(true)
  }
}
</script>