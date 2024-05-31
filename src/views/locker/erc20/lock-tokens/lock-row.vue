<template>
  <div class="border-b">
    <div class="c-list pa-2" @click="expandMenu = !expandMenu">
      <div class="d-flex align-center px-2">

        <div class="font-weight-medium d-flex align-center">
          {{ amountHumanWithCommas }} {{ tokenHydrated.symbol }}
          <v-icon v-if="errorMinimumLockAmount" small color="orange" class="ml-2">mdi-alert-outline</v-icon>
        </div>

        <v-spacer></v-spacer>

        <v-btn rounded text small @click.stop="expandMenu = !expandMenu" :color="expandMenu ? 'textFaint' : 'primary'">
          Edit
          <v-icon small :class="[{'rotate-180': expandMenu}]">mdi-chevron-down</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              icon
              small
              v-on="on"
              @click.stop="$emit('duplicate')"
            >
              <v-icon small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span>Duplicate</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              icon
              small
              v-on="on"
              @click.stop="$emit('remove-lock')"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>

      </div>

      <div class="d-flex align-center pb-1">
        <div v-if="!lockType1" :class="['caption ml-1 br-20 px-2 background']">
          <v-icon small color="blue">mdi-chart-line</v-icon>
          Linear lock
        </div>

        <div v-if="!lockType1" class="px-2 textFaint--text caption">
          {{ startDateHuman }} - 
          <span class="textFaint--text caption">{{ endDateHuman }}</span>
        </div>
        <div v-else class="px-2 textFaint--text caption">
          Unlocks: <strong>{{ endDateFromNow }}</strong> | 
          <span class="textFaint--text caption">{{ endDateHuman }}</span>
        </div>
      </div>

      <div class="caption d-flex align-center">
        <div :class="['ml-1 br-20 px-2 background']">
          Unlocker: 
          <span v-if="unlockerIsMe" class="primary--text">
            Me
          </span>
          <template v-else>
            <template v-if="!ownerIsValid">
              <v-icon small color="orange">mdi-alert-outline</v-icon>
            </template>
            <template v-else>
              {{ unlockerAddressCondensed }}
            </template>
          </template>
        </div>
      </div>
    </div>

    <v-expand-transition>
      <div v-show="expandMenu">
        <div class="background pa-2">
          <div class="v-card pa-4">
            <div class="mt-10 mb-2 font-weight-bold text-center">
              Who can withdraw the tokens?
            </div>

            <div class="text-center">
              <v-btn rounded depressed :color="unlockerIsMe ? 'primary--text' : 'textFaint--text'" @click="unlockerIsMe = true">
                Me
              </v-btn>
              <v-btn rounded depressed :color="!unlockerIsMe ? 'primary--text' : 'textFaint--text'" @click="unlockerIsMe = false">
                Someone else
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="!unlockerIsMe">
                <div class="textFaint--text text-center caption py-2">
                  *Allow someone else to withdraw these tokens after the lock date.
                </div>
                <div class="mt-2 d-flex align-center pa-3 r-outlined br-8 inputcolor">
                  <c-input v-model:value="lock.owner" placeholder="Unlocker address">
                  </c-input>
                </div>
                <div v-if="ownerIsValid" class="justify-center caption primary--text d-flex align-center">
                  Valid address
                  <v-icon small color="primary" class="ml-2">mdi-check</v-icon>
                </div>
                <div v-else class="justify-center caption orange--text d-flex align-center">
                  Invalid address
                  <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
                </div>
              </div>
            </v-expand-transition>
            
            <div class="mt-10 mb-2 font-weight-bold text-center">
              Lock how many tokens?
            </div>

            <div class="pa-4 align-center flex-nowrap inputcolor r-outlined">

              <div class="caption text-end pt-2">
                Balance: {{ tokenBalanceHuman }}
              </div>

              <div class="d-flex align-center">
                <c-input v-model:value="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 font-weight-bold">
                </c-input>

                <div class="font-weight-bold">
                  {{ tokenHydrated.symbol }}
                </div>

                <v-btn small rounded depressed color="primary" @click="setMax" class="ml-2">
                  MAX
                </v-btn>
              </div>

              <div>
                <v-btn small outlined rounded color="" @click="setPercent(25)" class="mr-1">
                  25%
                </v-btn>
                <v-btn small outlined rounded color="" @click="setPercent(50)" class="mr-1">
                  50%
                </v-btn>
                <v-btn small outlined rounded color="" @click="setPercent(75)" class="mr-1">
                  75%
                </v-btn>
                <v-btn small outlined rounded color="" @click="setMax" class="mr-1">
                  100%
                </v-btn>
              </div>

            </div>

            <div v-if="errorMinimumLockAmount" class="justify-center caption orange--text d-flex align-center">
              Minimum lock amount {{ minimumLockAmount }} {{ tokenHydrated.symbol }}
              <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
            </div>

            <div class="text-center mt-10">
              <v-btn rounded depressed :class="lockType1 ? 'primary--text' : 'textFaint--text'" @click="lockType1 = true">
                Unlock on date
              </v-btn>
              <v-btn rounded depressed :color="!lockType1 ? 'blue--text' : 'textFaint--text'" @click="lockType1 = false">
                Unlock over time
              </v-btn>
            </div>

            <div v-if="lockType1" class="mt-8 d-flex align-start inputcolor r-outlined pa-4">
              <div>
                <div class="font-weight-bold">
                  {{ endDateHuman }}
                </div>
                <div class="">
                  {{ endDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                </div>
              </div>
              <v-spacer></v-spacer>
              <c-date @setDate="setEndEmission"></c-date>
            </div>

            <div v-if="!lockType1" class="v-card pa-2">
              <div class="mt-8 text-center textFaint--text caption">
                <div>
                <v-icon size='40' color="blue">mdi-chart-line</v-icon>
                </div>
                Allows you to withdraw tokens every block, scaled linearly over time
              </div>
              <div class="mt-8 text-center textFaint--text caption">
                Start date
              </div>
              <div class="mt-2 d-flex align-start inputcolor r-outlined pa-4">
                <div>
                  <div class="font-weight-bold">
                    {{ startDateHuman }}
                  </div>
                  <div class="">
                    {{ startDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                  </div>
                </div>
                <v-spacer></v-spacer>
                <c-date @setDate="setStartEmission" color="blue"></c-date>
              </div>
              <div class="mt-8 text-center textFaint--text caption">
                End date
              </div>
              <div class="mt-2 d-flex align-start inputcolor r-outlined pa-4">
                <div>
                  <div class="font-weight-bold">
                    {{ endDateHuman }}
                  </div>
                  <div class="">
                    {{ endDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                  </div>
                </div>
                <v-spacer></v-spacer>
                <c-date @setDate="setEndEmission" color="blue"></c-date>
              </div>

              <div v-if="lock.start_emission >= lock.end_emission" class="mt-2 justify-center caption orange--text d-flex align-center">
                End date must be after start date
                <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
              </div>

              <template v-else>
                <linear-lock-chart :lock="lock" :tokenHydrated="tokenHydrated"></linear-lock-chart>
              </template>

            </div>

          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import CDate from '@/components/ui/date-picker'
import moment from 'moment'
import LinearLockChart from '@/views/locker/erc20/charts/linear-lock'
import Utils from '@/web3/utils'

export default {
  props: {
    lock: {
      type: Object,
      default: () => ({})
    },
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    balance: {
      type: String,
      default: '0'
    }
  },

  components: {
    CDate,
    LinearLockChart
  },

  setup(props, { emit }) {
    const expandMenu = ref(false)
    const amountHuman = ref('0')
    
    const sClient = computed(() => {
      return this.$store.state.signer
    })

    const unlockerAddressCondensed = computed(() => {
      const address = props.lock.owner
      if (!address) {
        return ''
      }
      return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    })

    const unlockerIsMe = computed({
      get() {
        return props.lock.owner === sClient.value.address
      },
      set(_bool) {
        if (_bool) {
          props.lock.owner = sClient.value.address
        } else {
          props.lock.owner = ''
        }
      }
    })

    const lockType1 = computed({
      get() {
        return props.lock.start_emission === 0
      },
      set(_bool) {
        if (_bool) {
          props.lock.start_emission = 0
        } else {
          props.lock.start_emission = moment().unix()
        }
      }
    })

    const minimumLockAmount = computed(() => {
      return 0
    })

    const tokenBalanceHuman = computed(() => {
      const amount = Utils.convertMicroDenomToDenom(props.balance, props.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 6})
    })

    const amountHumanWithCommas = computed(() => {
      return Number(amountHuman.value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: props.tokenHydrated.decimals})
    })

    const startDateHuman = computed(() => {
      return moment.unix(props.lock.start_emission).format('DD MMM YYYY HH:mm')
    })

    const startDateFromNow = computed(() => {
      return moment.unix(props.lock.start_emission).fromNow()
    })

    const endDateHuman = computed(() => {
      return moment.unix(props.lock.end_emission).format('DD MMM YYYY HH:mm')
    })

    const endDateFromNow = computed(() => {
      return moment.unix(props.lock.end_emission).fromNow()
    })

    const ownerIsValid = computed(() => {
      return true
    })

    const errorMinimumLockAmount = computed(() => {
      return false
    })

    const setMax = () => {
      props.lock.amount = props.balance
      amountHuman.value = Utils.convertMicroDenomToDenom(props.balance, props.tokenHydrated.decimals)
    }

    const setPercent = (percent) => {
      props.lock.amount = props.balance * percent / 100
      amountHuman.value = Utils.convertMicroDenomToDenom(props.lock.amount, props.tokenHydrated.decimals)
    }

    const setStartEmission = (date) => {
      props.lock.start_emission = date.unix()
    }

    const setEndEmission = (date) => {
      if (lockType1.value) {
        props.lock.end_emission = date.unix()
      }
      props.lock.end_emission = date.unix()
    }

    const onHumanAmountChange = (val) => {
      props.lock.amount = Utils.convertDenomToMicroDenom(val, props.tokenHydrated.decimals)
    }

    watch(props.lock.amount, (newVal) => {
      amountHuman.value = Utils.convertMicroDenomToDenom(newVal, props.tokenHydrated.decimals)
    })

    return {
      expandMenu,
      amountHuman,
      sClient,
      unlockerAddressCondensed,
      unlockerIsMe,
      lockType1,
      minimumLockAmount,
      tokenBalanceHuman,
      amountHumanWithCommas,
      startDateHuman,
      startDateFromNow,
      endDateHuman,
      endDateFromNow,
      ownerIsValid,
      errorMinimumLockAmount,
      setMax,
      setPercent,
      setStartEmission,
      setEndEmission,
      onHumanAmountChange
    }
  }
}
</script>
