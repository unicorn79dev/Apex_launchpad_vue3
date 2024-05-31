<template>
  <div>
    <div class="pa-4 border-b background">
      <div class="d-flex align-center">
        <coin-icon :address="tokenHydrated.address" class="mr-3"></coin-icon>
        <div class="d-flex align-center">
          Your Vested
          <v-btn text @click.stop="openTokenPopup" class="ml-2 pa-0 font-weight-bold" style="min-width: 10px;">
            <span class="text-truncate" :style="breakpointXs ? 'max-width: 10ch;' : 'max-width: 20ch;'">
              {{ tokenHydrated.symbol }}
            </span>
            <v-icon small color="textFaint">mdi-chevron-up</v-icon>
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        <v-btn v-if="!loading" @click="refresh" icon color="textFaint">
          <v-icon small>mdi-refresh</v-icon>
        </v-btn>
        <div v-else style="height: 36px; width: 36px;" class="d-flex align-center justify-center">
          <v-progress-circular indeterminate size="14" width="2" color="primary"></v-progress-circular>
        </div>
      </div>
      <div class="caption textFaint--text">
        Your Balance: {{ userBalanceHuman }}
      </div>
    </div>

    <div v-if="firstLoad" class="text-center py-4">
      <v-progress-circular indeterminate size="60" width="2" color="#aaa">
        <img :src="require('@/assets/img/APEX.png')" height="40px" class="greyscale" width="40px">
      </v-progress-circular>
    </div>

    <v-slide-y-transition>
      <div v-if="!firstLoad">
        <div class="pa-2 d-flex align-center textFaint--text pl-10">
          {{ filteredLocks.length }} / {{ numLocks }} locks
          <v-spacer></v-spacer>
          <v-menu offset-y transition="scale-transition" :close-on-content-click="false">
            <template v-slot:activator="{ attrs, on }">
              <v-btn small rounded outlined v-bind="attrs" v-on="on">
                <div class="mr-1 textFaint--text">
                  Filter
                  <v-icon class="" color="primary" v-if="filters.showLocked" size="16">mdi-lock</v-icon>
                  <v-icon class="" color="textFaint" v-if="filters.showUnlocked" size="16">mdi-lock-open-outline</v-icon>
                  <v-icon class="" color="textFaint" v-if="filters.showWithdrawn" size="16">mdi-check-circle-outline</v-icon>
                </div>
                <div v-if="filters.sort === 'liquidity'">liquidity</div>
                <div v-if="filters.sort === 'uniswap_index'">latest</div>
                <div v-if="filters.sort === 'most_recent_lock'">new lock</div>
                <div v-else-if="filters.sort === 'lock_value'">value</div>
                <v-icon small color="textFaint" :class="{ 'rotate-180': filters.sortAscending }">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list style="min-width: 200px;" class="pa-0 foreground">
              <div class="pa-4 background caption font-italic">Show</div>
              <v-list-item @click="filters.showLocked = !filters.showLocked">
                <v-list-item-title>Locked</v-list-item-title>
                <v-list-item-action>
                  <v-checkbox :input-value="filters.showLocked"></v-checkbox>
                </v-list-item-action>
              </v-list-item>
              <v-list-item @click="filters.showUnlocked = !filters.showUnlocked">
                <v-list-item-title>Unlocked</v-list-item-title>
                <v-list-item-action>
                  <v-checkbox :input-value="filters.showUnlocked" color="orange"></v-checkbox>
                </v-list-item-action>
              </v-list-item>
              <v-list-item @click="filters.showWithdrawn = !filters.showWithdrawn">
                <v-list-item-title>Withdrawn</v-list-item-title>
                <v-list-item-action>
                  <v-checkbox :input-value="filters.showWithdrawn" color="textFaint"></v-checkbox>
                </v-list-item-action>
              </v-list-item>
              <div class="pa-4 background caption font-italic">Sort</div>
              <v-list-item @click="sortList('value')">
                <v-list-item-title>Amount</v-list-item-title>
                <v-icon v-if="filters.sort === 'value'" color="primary" :class="['ml-1', { 'rotate-180': filters.sortAscending }]">mdi-chevron-down</v-icon>
              </v-list-item>
              <v-list-item @click="sortList('latest')">
                <v-list-item-title>Newest Lock</v-list-item-title>
                <v-icon v-if="filters.sort === 'latest'" color="primary" :class="['ml-1', { 'rotate-180': filters.sortAscending }]">mdi-chevron-down</v-icon>
              </v-list-item>
              <v-list-item @click="sortList('unlock_date')">
                <v-list-item-title>Unlock Date</v-list-item-title>
                <v-icon v-if="filters.sort === 'unlock_date'" color="primary" :class="['ml-1', { 'rotate-180': filters.sortAscending }]">mdi-chevron-down</v-icon>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <template v-if="numLocks > 0">
          <div v-if="filteredLocks.length === 0" class="pa-4 textFaint--text text-center">
            No locks for your selection (see filters)
          </div>
          <div v-else>
            <v-row dense class="background border-b caption font-weight-medium textFaint--text">
              <v-col class="ml-10">Amount</v-col>
              <v-col class="text-end mr-10">Unlock Date</v-col>
            </v-row>

            <user-row 
              v-for="lock in paginatedLocks" 
              :key="lock.id"
              :item="lock"
              :tokenHydrated="tokenHydrated"
              @withdraw="withdraw" 
              @migrate="migrate" 
              @relock="relock" 
              @transfer-ownership="transferOwnership" 
              @increment="increment" 
              @split="split"
              @revoke="revoke">
            </user-row>

            <div v-if="pageCount > 1" class="d-flex align-center justify-center background pa-2">
              <v-btn @click="goPrevious" text :disabled="page === 0">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              {{ page + 1 }} / {{ pageCount }}
              <v-btn @click="goNext" text :disabled="!nextPageExists">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </template>
      </div>
    </v-slide-y-transition>

    <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>
    <relock-dialog ref="relockDialog"></relock-dialog>
    <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>
    <migrate-dialog ref="migrateDialog"></migrate-dialog>
    <increment-dialog ref="incrementDialog"></increment-dialog>
    <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>
    <revoke-dialog ref="revokeDialog"></revoke-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import VestingPager from '@/smart-contracts/token-locker/pager-contract';
import VestingContract from '@/smart-contracts/token-locker/token-locker-contract';
import VESTABI from '@/smart-contracts/token-locker/token-locker-abis';
import UserRow from './user-row';
import WithdrawDialog from './dialogs/withdraw-dialog';
import MigrateDialog from './dialogs/migrate-dialog';
import IncrementDialog from './dialogs/increment-dialog';
import RelockDialog from './dialogs/relock-dialog';
import SplitLockDialog from './dialogs/split-lock-dialog';
import TransferOwnershipDialog from './dialogs/transfer-ownership-dialog';
import RevokeDialog from './dialogs/revoke-dialog';
import ERC20 from '@/smart-contracts/erc20';
import { ethers } from 'ethers';
import moment from 'moment';

// Setup
const store = useStore();

const props = defineProps({
  tokenHydrated: {
    type: Object,
    default: () => ({
      symbol: '',
      name: '',
      decimals: '0'
    })
  }
});

const numLocks = ref('0');
const locks = ref([]);
const page = ref(0);
const rowsPerPage = ref(10);
const userBalance = ref('0');
const totalShares = ref('0');
const firstLoad = ref(true);
const loading = ref(true);
const filters = ref({
  sort: 'value',
  sortAscending: false,
  showLocked: true,
  showUnlocked: false,
  showWithdrawn: false,
});

const sEthers = computed(() => store.state.ethers);
const breakpointXs = ref(window.innerWidth < 600);

const handleResize = () => {
  breakpointXs.value = window.innerWidth < 600;
};

// Add event listener for resize events
onMounted(() => {
  window.addEventListener('resize', handleResize);
  refresh();
});

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const nextPageExists = computed(() => (page.value + 1) * rowsPerPage.value < filteredLocks.value.length);
const pageCount = computed(() => {
  const count = Math.ceil(filteredLocks.value.length / rowsPerPage.value);
  return count === 0 ? 1 : count;
});

const filteredLocks = computed(() => {
  const now = moment().unix();
  return locks.value.filter(item => {
    if (filters.value.showWithdrawn && item.shares_deposited === item.shares_withdrawn) {
      return item;
    }
    if (filters.value.showUnlocked && item.end_emission < now && item.shares_withdrawn !== item.shares_deposited) {
      return item;
    }
    if (filters.value.showLocked && item.end_emission > now && item.shares_withdrawn !== item.shares_deposited) {
      return item;
    }
  });
});

const sortedLocks = computed(() => {
  const duplicate = JSON.parse(JSON.stringify(filteredLocks.value));
  duplicate.sort((a, b) => {
    if (filters.value.sort === 'value') {
      const aAmount = ethers.BigNumber.from(a.tokens_deposited).sub(a.tokens_withdrawn);
      const bAmount = ethers.BigNumber.from(b.tokens_deposited).sub(b.tokens_withdrawn);
      if (aAmount.gt(bAmount)) {
        return filters.value.sortAscending ? 1 : -1;
      }
      if (bAmount.gt(aAmount)) {
        return filters.value.sortAscending ? -1 : 1;
      }
      return 0;
    } else if (filters.value.sort === 'latest') {
      return filters.value.sortAscending ? a.lock_id - b.lock_id : b.lock_id - a.lock_id;
    } else if (filters.value.sort === 'unlock_date') {
      return filters.value.sortAscending ? b.end_emission - a.end_emission : a.end_emission - b.end_emission;
    }
  });
  return duplicate;
});

const paginatedLocks = computed(() => {
  const offset = page.value * rowsPerPage.value;
  return sortedLocks.value.slice(offset, offset + rowsPerPage.value);
});

const userBalanceHuman = computed(() => {
  const amount = ethers.utils.formatUnits(userBalance.value, props.tokenHydrated.decimals);
  return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: props.tokenHydrated.decimals });
});

const refresh = async () => {
  await getTotalShares();
  await fetchAllLocks();
  await getUserBalance();
};

const getTotalShares = async () => {
  const shares = await VestingContract.getTotalShares(props.tokenHydrated.address);
  totalShares.value = shares;
};

const getUserTokenLocks = async (_start, _count) => {
  return await VestingPager.getUserTokenLocks(sEthers.value.coinbase, props.tokenHydrated.address, _start, _count);
};

const getUserLocksForTokenLength = async () => {
  const numLocksValue = await VestingPager.getUserLocksForTokenLength(sEthers.value.coinbase, props.tokenHydrated.address);
  numLocks.value = numLocksValue;
};

const fetchAllLocks = async () => {
  loading.value = true;
  await getUserLocksForTokenLength();
  const rows = [];
  let pageNum = 0;
  while (rows.length < numLocks.value) {
    const lockIds = await getUserTokenLocks(pageNum * VESTABI.MAX_GETTER_LENGTH, VESTABI.MAX_GETTER_LENGTH);
    const locksValue = await VestingPager.getLocks(lockIds);
    rows.push(...locksValue);
    pageNum++;
  }
  locks.value = rows;
  firstLoad.value = false;
  loading.value = false;
};

const getUserBalance = async () => {
  const balanceValue = await ERC20.getBalance(sEthers.value.coinbase, props.tokenHydrated.address);
  userBalance.value = balanceValue;
};

const goNext = () => {
  page.value++;
};

const goPrevious = () => {
  page.value--;
};

const sortList = (sorting) => {
  if (filters.value.sort === sorting) {
    filters.value.sortAscending = !filters.value.sortAscending;
  } else {
    filters.value.sort = sorting;
    filters.value.sortAscending = false;
  }
};

const openTokenPopup = () => {
  $root.tokenPage.open(props.tokenHydrated.address, store.state.requiredNetwork);
};

const withdraw = (item) => {
  $refs.withdrawDialog.open(item, props.tokenHydrated)
    .then(() => {
      refresh();
    })
    .catch(() => {});
};

const transferOwnership = (item) => {
  $refs.transferOwnershipDialog.open(item);
};

const relock = (item) => {
  $refs.relockDialog.open(item);
};

const migrate = (item) => {
  $refs.migrateDialog.open(item, props.tokenHydrated);
};

const increment = (item) => {
  $refs.incrementDialog.open(item, props.tokenHydrated);
};

const split = (item) => {
  $refs.splitLockDialog.open(item, props.tokenHydrated);
};

const revoke = (item) => {
  $refs.revokeDialog.open(item, props.tokenHydrated);
};

watch(() => props.tokenHydrated, () => {
  page.value = 0;
  refresh();
});

watch(filters, {
  deep: true,
  handler() {
    page.value = 0;
  }
});

watch(() => sEthers.value, () => {
  refresh();
});

refresh();
</script>
