<template>
  <div>
    <div class="pa-4 border-b">
      <div class="d-flex align-center">
        <coin-icon :address="tokenHydrated.address" class="mr-3"></coin-icon>
        <div>
          {{ tokenHydrated.symbol }} Token locks
        </div>
        <v-spacer></v-spacer>
        <v-btn @click="refresh" icon>
          <v-icon color="textFaint" small>mdi-refresh</v-icon>
        </v-btn>
      </div>

      <div v-if="false">
        <div>
          <copy-address :address="tokenHydrated.address" color="textFaint"></copy-address>
        </div>
        <div class="d-flex caption textFaint--text">
          Your Balance: {{ userBalanceHuman }}
          <v-spacer></v-spacer>
          Contract Balance: {{ contractBalanceHuman }}
        </div>
        <div class="textFaint--text caption font-italic">
          Shares: {{ totalShares }}
        </div>
      </div>
    </div>

    <!-- MAIN AREA -->
    <div v-if="firstLoad" class="text-center py-4">
      <v-progress-circular
      indeterminate
      size="60"
      width="2"
      color="#aaa">
        <img 
        :src="require('@/assets/img/APEX.png')" 
        height="40px"
        class="greyscale"
        width="40px">
      </v-progress-circular>
    </div>
    <v-expand-transition>
      <div v-if="!firstLoad">
        <div v-if="locks.length === 0" class="pa-8 text-center">
          <img 
          :src="require('@/assets/img/flags/exclamation.svg')" 
          height="26px"
          class="mr-2"
          width="26px">
          <div>
            No Token Locks for this token
          </div>
          <div class="textFaint--text caption">
             on Unicrypt
          </div>
        </div>
        <div v-else>
          <!-- CHART BLOCK -->
          <div class="border-b py-3 background blocks-green white--text cursor-pointer" @click="expandLocks = !expandLocks">
            <div class="text-center mt-2">
              <div style="width: 50%;" class="mx-auto">
                <v-progress-circular
                :value="totalLockedAsPercentOfTotal"
                :rotate="-90"
                size="60"
                width="4"
                color="white">
                  <v-icon size="35" color="white">mdi-lock-outline</v-icon>
                </v-progress-circular>
                <div class="text-center px-4">
                  {{ totalLockedHuman }} {{ tokenHydrated.symbol }} Locked
                </div>
              </div>
              <div class="caption text-center white--text">
                <span class="font-weight-bold">
                  {{ totalLockedAsPercentOfTotal }}%
                </span>
                locked of total supply
              </div>
              <v-btn rounded text small color="white" @click.stop="expandLocks = !expandLocks">
                Show locks
                <v-icon small :class="[{'rotate-180': expandLocks}]">mdi-chevron-down</v-icon>
              </v-btn>
            </div>
          </div>
          <!-- CHART BLOCK -->
          <v-expand-transition>
            <div v-if="expandLocks">
              <div v-if="filteredLocks.length > 0">
                <v-row dense class="background border-b caption font-weight-medium textFaint--text">
                  <v-col class="ml-10">
                    Amount
                  </v-col>
                  <v-col class="text-end mr-10">
                    Unlock Date
                  </v-col>
                </v-row>

                <user-row 
                v-for="lock in paginatedLocks" 
                :key="lock.lock_id"
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

              <div v-else class="text-center pa-4 textFaint--text background">
                No locks for your filters
              </div>
            </div>
          </v-expand-transition>
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
import { ref, reactive, computed, watch, onMounted } from 'vue';
import UserRow from '../user/user-row'
import WithdrawDialog from '../user/dialogs/withdraw-dialog'
import MigrateDialog from '../user/dialogs/migrate-dialog'
import IncrementDialog from '../user/dialogs/increment-dialog'
import RelockDialog from '../user/dialogs/relock-dialog'
import SplitLockDialog from '../user/dialogs/split-lock-dialog'
import TransferOwnershipDialog from '../user/dialogs/transfer-ownership-dialog'
import RevokeDialog from '../user/dialogs/revoke-dialog'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'
import {store} from '@/store/index'

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
    isForUser: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const numLocks = ref('0');
    const locks = ref([]);
    const page = ref(0);
    const rowsPerPage = ref(10);
    const userBalance = ref('0');
    const contractBalance = ref('0');
    const totalShares = ref('0');
    const filters = reactive({
      sort: 'value',
      sortAscending: false,
      showLocked: true,
      showUnlocked: false,
      showWithdrawn: false,
    });
    const firstLoad = ref(true);
    const expandLocks = ref(false);

    const sClient = computed(() => store.state.signer);
    const nextPageExists = computed(() => (page.value + 1) * rowsPerPage.value < filteredLocks.value.length);
    const pageCount = computed(() => {
      var count = Math.ceil(filteredLocks.value.length / rowsPerPage.value);
      return count === 0 ? 1 : count;
    });
    const totalLocked = computed(() => {
      var amount = locks.value.reduce((a, item) => {
        return a + Number(item.tokens_deposited) - Number(item.tokens_withdrawn);
      }, 0);
      return amount;
    });
    const totalLockedAsPercentOfTotal = computed(() => {
      var amount = (totalLocked.value * 10000 / props.tokenHydrated.total_supply).toString();
      return Number(amount) / 100;
    });
    const totalLockedHuman = computed(() => {
      return this.$root.formatAmount(totalLocked.value, props.tokenHydrated.decimals);
    });
    const filteredLocks = computed(() => {
      return locks.value;
    });
    const sortedLocks = computed(() => {
      return locks.value;
    });
    const paginatedLocks = computed(() => {
      var offset = page.value * rowsPerPage.value;
      return sortedLocks.value.slice(offset, offset + rowsPerPage.value);
    });
    const userBalanceHuman = computed(() => {
      var amount = Utils.convertMicroDenomToDenom(userBalance.value, props.tokenHydrated.decimals);
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: props.tokenHydrated.decimals});
    });
    const contractBalanceHuman = computed(() => {
      var amount = Utils.convertMicroDenomToDenom(contractBalance.value, props.tokenHydrated.decimals);
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: props.tokenHydrated.decimals});
    });

    watch(() => props.tokenHydrated, () => {
      page.value = 0;
      refresh();
    });

    onMounted(() => {
      if (sClient.value && !firstLoad.value) {
        refresh();
      }
    });

    function refresh() {
      page.value = 0;
      setTimeout(() => {
        firstLoad.value = false;
      }, 1000);
    }

    function goNext() {
      page.value += 1;
    }

    function goPrevious() {
      page.value -= 1;
    }

    function withdraw(lock) {
      this.$refs.withdrawDialog.open(lock);
    }

    function migrate(lock) {
      this.$refs.migrateDialog.open(lock);
    }

    function relock(lock) {
      this.$refs.relockDialog.open(lock);
    }

    function increment(lock) {
      this.$refs.incrementDialog.open(lock);
    }

    function transferOwnership(lock) {
      this.$refs.transferOwnershipDialog.open(lock);
    }

    function split(lock) {
      this.$refs.splitLockDialog.open(lock);
    }

    function revoke(lock) {
      this.$refs.revokeDialog.open(lock);
    }

    return {
      numLocks,
      locks,
      page,
      rowsPerPage,
      userBalance,
      contractBalance,
      totalShares,
      filters,
      firstLoad,
      expandLocks,
      sClient,
      nextPageExists,
      pageCount,
      totalLocked,
      totalLockedAsPercentOfTotal,
      totalLockedHuman,
      filteredLocks,
      sortedLocks,
      paginatedLocks,
      userBalanceHuman,
      contractBalanceHuman,
      refresh,
      goNext,
      goPrevious,
      withdraw,
      migrate,
      relock,
      increment,
      transferOwnership,
      split,
      revoke
    }
  }
}
</script>
<style scoped>
.greyscale {
  filter: grayscale(100%);
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>


