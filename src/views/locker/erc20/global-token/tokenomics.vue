<template>
  <div>
    <!-- MAIN AREA -->
    <div v-if="firstLoad" class="text-center py-4">
      <v-progress-circular
        indeterminate
        size="60"
        width="2"
        color="#aaa"
      >
        <img
        :src="require('@/assets/img/APEX.png')"
          height="40px"
          class="greyscale"
          width="40px"
        />
      </v-progress-circular>
    </div>
    <v-expand-transition>
      <div v-if="!firstLoad">
        <div>
          <!-- CHART BLOCK -->
          <div class="border-b pb-3 cursor-pointer">
            <div class="mt-2 pa-3">
              <div class="d-flex textFaint--text caption">
                Total Supply
                <v-spacer></v-spacer>
                {{ totalSupplyHuman }}
              </div>
              <div v-if="totalConditionalLockedHuman !== '0'">
                <div class="d-flex textFaint--text caption">
                  Conditional locks (excluded)
                  <v-spacer></v-spacer>
                  <span class="blue--text">{{ totalConditionalLockedHuman }}</span>
                </div>
              </div>
              <div class="d-flex">
                Tokens locked
                <v-spacer></v-spacer>
                <span class="primary--text">{{ totalLockedHuman }}</span>
              </div>
              <div style="width: 50%;" class="mx-auto text-center">
                <v-progress-circular
                  :value="totalLockedAsPercentOfTotal"
                  :rotate="-90"
                  size="60"
                  width="4"
                  color="primary"
                >
                  <v-icon size="35" color="primary">mdi-lock-outline</v-icon>
                </v-progress-circular>
              </div>
              <div class="text-center primary--text">
                <div class="font-weight-bold">
                  {{ totalLockedAsPercentOfTotal }}%
                </div>
                <div class="caption textFaint--text font-italic">
                  locked of total supply
                </div>
              </div>
            </div>
          </div>
          <!-- CHART BLOCK -->
          <div>
            <div v-if="filteredLocks.length > 0">
              <v-row
                dense
                class="background border-b caption font-weight-medium textFaint--text"
              >
                <v-col class="ml-10">
                  Amount
                </v-col>
                <v-col class="text-end mr-10">
                  Unlock Date
                </v-col>
              </v-row>
              <user-row
                v-for="lock in paginatedLocks"
                :key="lock.id"
                :item="lock"
                :tokenHydrated="tokenHydrated"
                :network="cNetwork"
                :disableDialogs="true"
                @withdraw="withdraw"
                @migrate="migrate"
                @relock="relock"
                @transfer-ownership="transferOwnership"
                @increment="increment"
                @split="split"
                @revoke="revoke"
              ></user-row>
              <div
                v-if="pageCount > 1"
                class="d-flex align-center justify-center background pa-2"
              >
                <v-btn @click="goPrevious" text :disabled="page === 0">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                {{ page + 1 }} / {{ pageCount }}
                <v-btn @click="goNext" text :disabled="!nextPageExists">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-else class="text-center pa-4 textFaint--text background">
              No locks for this token
            </div>
          </div>
        </div>
      </div>
    </v-expand-transition>
    <!-- END MAIN AREA -->

    <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>
    <relock-dialog ref="relockDialog"></relock-dialog>
    <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>
    <migrate-dialog ref="migrateDialog"></migrate-dialog>
    <increment-dialog ref="incrementDialog"></increment-dialog>
    <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>
    <revoke-dialog ref="revokeDialog"></revoke-dialog>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import VestingPager from '@/smart-contracts/token-locker/pager-contract'
import VESTABI from '@/smart-contracts/token-locker/token-locker-abis'
import UserRow from '../user/user-row'
import WithdrawDialog from '../user/dialogs/withdraw-dialog'
import MigrateDialog from '../user/dialogs/migrate-dialog'
import IncrementDialog from '../user/dialogs/increment-dialog'
import RelockDialog from '../user/dialogs/relock-dialog'
import SplitLockDialog from '../user/dialogs/split-lock-dialog'
import TransferOwnershipDialog from '../user/dialogs/transfer-ownership-dialog'
import RevokeDialog from '../user/dialogs/revoke-dialog'
import { ethers } from 'ethers'
import moment from 'moment'

export default {
  components: {
    UserRow,
    WithdrawDialog,
    MigrateDialog,
    RelockDialog,
    TransferOwnershipDialog,
    IncrementDialog,
    SplitLockDialog,
    RevokeDialog
  },

  props: {
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    network: {
      type: String,
      default: null
    }
  },

  setup(props) {
    const numLocks = ref('0')
    const locks = ref([])
    const page = ref(0)
    const rowsPerPage = ref(1)
    const filters = ref({
      sort: 'value',
      sortAscending: false,
      showLocked: true // if false shows all others (withdrawn and unlocked)
    })
    const firstLoad = ref(true)

    const cNetwork = computed(() => {
      return props.network ? props.network : store.state.requiredNetwork
    })
    const sEthers = computed(() => store.state.ethers)

    const nextPageExists = computed(() => {
      return (page.value + 1) * rowsPerPage.value < filteredLocks.value.length
    })
    const pageCount = computed(() => {
      var count = Math.ceil(filteredLocks.value.length / rowsPerPage.value)
      return count === 0 ? 1 : count
    })

    const totalSupplyHuman = computed(() => {
      return formatAmount(props.tokenHydrated.totalSupply, props.tokenHydrated.decimals)
    })

    const totalConditionalLocked = computed(() => {
      var now = moment().unix()
      var filteredLocks = locks.value.filter(item => {
        return (
          item.end_emission > now &&
          item.shares_withdrawn !== item.shares_deposited &&
          item.condition !== ethers.constants.AddressZero
        )
      })
      var amount = filteredLocks.reduce((a, item) => {
        return a.add(item.tokens_deposited).sub(item.tokens_withdrawn)
      }, ethers.BigNumber.from(0))
      return amount
    })

    const totalLocked = computed(() => {
      var now = moment().unix()
      var filteredLocks = locks.value.filter(item => {
        return (
          item.end_emission > now &&
          item.shares_withdrawn !== item.shares_deposited &&
          item.condition === ethers.constants.AddressZero
        )
      })
      var amount = filteredLocks.reduce((a, item) => {
        return a.add(item.tokens_deposited).sub(item.tokens_withdrawn)
      }, ethers.BigNumber.from(0))
      return amount
    })

    const totalLockedAsPercentOfTotal = computed(() => {
      var amount = totalLocked.value
        .mul(10000)
        .div(props.tokenHydrated.totalSupply)
        .toString()
      return Number(amount) / 100
    })

    const totalLockedHuman = computed(() => {
      return formatAmount(totalLocked.value, props.tokenHydrated.decimals)
    })

    const totalConditionalLockedHuman = computed(() => {
      return formatAmount(totalConditionalLocked.value, props.tokenHydrated.decimals)
    })

    const lockedLocks = computed(() => {
      var now = moment().unix()
      return locks.value.filter(item => {
        return (
          item.end_emission > now &&
          item.shares_withdrawn !== item.shares_deposited
        )
      })
    })

    const unlockedLocks = computed(() => {
      var now = moment().unix()
      return locks.value.filter(item => {
        return (
          item.end_emission < now ||
          item.shares_withdrawn === item.shares_deposited
        )
      })
    })

    const filteredLocks = computed(() => {
      return lockedLocks.value.length > 0 ? lockedLocks.value : unlockedLocks.value
    })

    const sortedLocks = computed(() => {
      var duplicate = JSON.parse(JSON.stringify(filteredLocks.value))
      duplicate.sort((a, b) => {
        if (filters.value.sort === 'value') {
          var aAmount = ethers.BigNumber.from(a.tokens_deposited).sub(a.tokens_withdrawn)
          var bAmount = ethers.BigNumber.from(b.tokens_deposited).sub(b.tokens_withdrawn)
          if (aAmount.gt(bAmount)) {
            return filters.value.sortAscending ? 1 : -1
          }
          if (bAmount.gt(aAmount)) {
            return filters.value.sortAscending ? -1 : 1
          }
          return 0
        } else if (filters.value.sort === 'latest') {
          return filters.value.sortAscending ? a.lock_id - b.lock_id : b.lock_id - a.lock_id
        } else if (filters.value.sort === 'unlock_date') {
          return filters.value.sortAscending ? b.end_emission - a.end_emission : a.end_emission - b.end_emission
        }
      })
      return duplicate
    })

    const paginatedLocks = computed(() => {
      var offset = page.value * rowsPerPage.value
      return sortedLocks.value.slice(offset, offset + rowsPerPage.value)
    })

    watch(
      () => props.tokenHydrated,
      () => {
        page.value = 0
        refresh()
      }
    )

    watch(
      filters,
      () => {
        page.value = 0
      },
      { deep: true }
    )

    watch(cNetwork, refresh)

    const goNext = () => {
      page.value++
    }

    const goPrevious = () => {
      page.value--
    }

    const sortList = sorting => {
      if (filters.value.sort === sorting) {
        filters.value.sortAscending = !filters.value.sortAscending
      } else {
        filters.value.sort = sorting
        filters.value.sortAscending = false
      }
    }

    const getLocksForTokenLength = async () => {
      var numLocksLength = await VestingPager.getTokenLocksLength(
        props.tokenHydrated.address,
        cNetwork.value
      )
      numLocks.value = numLocksLength
    }

    const fetchAllLocks = async () => {
      await getLocksForTokenLength()
      var rows = []
      var currentPage = 0
      while (rows.length < numLocks.value) {
        var lock_ids = await VestingPager.getTokenLocks(
          props.tokenHydrated.address,
          currentPage * VESTABI.MAX_GETTER_LENGTH,
          VESTABI.MAX_GETTER_LENGTH,
          cNetwork.value
        )
        var lockData = await VestingPager.getLocks(lock_ids, cNetwork.value)
        rows.push(...lockData)
        currentPage++
      }
      locks.value = rows
      firstLoad.value = false
    }

    const refresh = () => {
      fetchAllLocks()
    }

    const withdraw = item => {
      refs.withdrawDialog
        .open(item, props.tokenHydrated)
        .then(refresh)
        .catch(() => {})
    }

    const transferOwnership = item => {
      refs.transferOwnershipDialog.open(item)
    }

    const relock = item => {
      refs.relockDialog.open(item)
    }

    const migrate = item => {
      refs.migrateDialog.open(item, props.tokenHydrated)
    }

    const increment = item => {
      refs.incrementDialog.open(item, props.tokenHydrated)
    }

    const split = item => {
      refs.splitLockDialog.open(item, props.tokenHydrated)
    }

    const revoke = item => {
      refs.revokeDialog.open(item, props.tokenHydrated)
    }

    onMounted(refresh)

    return {
      numLocks,
      locks,
      page,
      rowsPerPage,
      filters,
      firstLoad,
      cNetwork,
      sEthers,
      nextPageExists,
      pageCount,
      totalSupplyHuman,
      totalConditionalLocked,
      totalLocked,
      totalLockedAsPercentOfTotal,
      totalLockedHuman,
      totalConditionalLockedHuman,
      lockedLocks,
      unlockedLocks,
      filteredLocks,
      sortedLocks,
      paginatedLocks,
      goNext,
      goPrevious,
      sortList,
      withdraw,
      transferOwnership,
      relock,
      migrate,
      increment,
      split,
      revoke
    }
  }
}
</script>
