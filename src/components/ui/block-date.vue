<template>
  <div class="d-flex align-center inputcolor pa-4 r-outlined">
    <div>
      <div>
        {{ dateHuman }}
      </div>
      <div class="">
        <span class="primary--text font-weight-medium">{{ dateFromNow }}</span> 
      </div>
      <div class="caption">
        <span class="textFaint--text">block {{ block }}</span>
      </div>
    </div>
    <v-spacer></v-spacer>
    <c-date @setDate="setDateFromPicker" ref="cdate"></c-date>

    <!-- SOMETHING -->
    <v-menu v-model="blockMenu" :close-on-content-click="false" offset-y>
    <!-- <v-menu v-model:value="blockMenu" :close-on-content-click="false" offset-y> -->
      <template #activator="{ on, attrs }">
        <v-btn icon outlined color="textFaint" class="ml-1" depressed v-bind="attrs" v-on="on">
          <slot name="header">
            <v-icon>mdi-cube-outline</v-icon>
          </slot>
        </v-btn>
      </template>

      <v-card class="pa-4" style="min-width: 300px;">
        <div>
          Block number
        </div>
        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <!-- <c-input :model-value="localBlock" @update:model-value="localBlock = $event" placeholder="Token address..."></c-input> -->
          <v-text-field v-model="localBlock" @update:model-value="localBlock = $event" placeholder="Token address..." type="input"></v-text-field>
        </div>
        <div class="caption text-center textFaint--text">
          Current block: {{ blockNumber }}
        </div>

        <div class="pa-2 mt-4">
          <v-btn @click="blockMenu = false" x-large rounded block color="primary">
            Accept
          </v-btn>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import CDate from '@/components/ui/date-picker'
import { ref, computed, watch } from 'vue'
import moment from 'moment'

export default {
  components: {
    CDate
  },

  props: {
    block: {
      type: String
    }
  },

  setup(props) {
    const date = ref(null)
    const blockMenu = ref(false)
    const localBlock = ref(props.block)

    const blockNumber = computed(() => {
      return $store.state.blockNumber
    })

    const dateHuman = computed(() => {
      return moment.unix(date.value).format('ddd D MMM YYYY HH:mm')
    })

    const dateFromNow = computed(() => {
      return moment.unix(date.value).fromNow()
    })

    const setDateFromPicker = (date) => {
      date.value = date.unix()
      const duration = moment.duration(moment(date).diff(moment()))
      const secs = duration.asSeconds()
      localBlock.value = (parseInt(blockNumber.value) + (secs / $store.state.blocksPerSecond)).toString()
    }

    watch(() => props.block, (newValue) => {
      const numBlocks = newValue - blockNumber.value
      const seconds = numBlocks * $store.state.blocksPerSecond
      const newDate = moment().add(seconds, 'seconds')
      date.value = newDate.unix()
      $refs.cdate.setDateFromExternal(newDate)
    })

    return {
      date,
      blockMenu,
      localBlock,
      blockNumber,
      dateHuman,
      dateFromNow,
      setDateFromPicker
    }
  }
}
</script>
