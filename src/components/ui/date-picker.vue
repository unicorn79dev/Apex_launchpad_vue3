<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
  >
  <!-- <v-menu
    v-model:value="menu"
    :close-on-content-click="false"
    offset-y
  > -->
    <template #activator="{ on, attrs }">
      <v-btn v-bind="attrs" depressed v-on="on">
        <slot name="header">
          <v-icon :color="color">mdi-calendar</v-icon>
          <v-icon small :color="color">mdi-chevron-down</v-icon>
        </slot>
      </v-btn>
    </template>

    <v-card class="pa-0">
      <v-tabs v-model="tab" background-color="transparent" color="basil" grow>
      <!-- <v-tabs v-model:value="tab" background-color="transparent" color="basil" grow> -->
        <v-tab>Date</v-tab>
        <v-tab>Time</v-tab>
      </v-tabs>

      <v-tabs-items v-model:value="tab">
        <v-tab-item>
          <v-date-picker v-model:value="date" class=""></v-date-picker>
        </v-tab-item>
        <v-tab-item>
          <v-time-picker v-model:value="time" format="24hr"></v-time-picker>
        </v-tab-item>
      </v-tabs-items>

      <div class="text-center pt-2">{{ formattedDate }}</div>

      <div class="pa-2">
        <v-btn @click="setDate" x-large rounded block color="primary" :disabled="!dateValid">
          Accept
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
import { ref, computed } from 'vue';
import moment from 'moment';

export default {
  props: {
    color: {
      type: String,
      default: 'primary'
    }
  },
  setup() {
    const menu = ref(false);
    const resolve = ref(null);
    const reject = ref(null);
    const date = ref(null);
    const time = ref("12:00");
    const tab = ref(0);

    const combinedDate = computed(() => `${date.value} ${time.value}`);
    const momentDate = computed(() => moment(combinedDate.value, 'YYYY-MM-DD HH:mm'));
    const dateValid = computed(() => momentDate.value.isValid());
    const formattedDate = computed(() => momentDate.value.format('ddd, MMM D, HH:mm'));

    const open = () => {
      menu.value = true;
      return new Promise((res, rej) => {
        resolve.value = res;
        reject.value = rej;
      });
    };

    const acceptStake = () => {
      resolve.value();
      menu.value = false;
    };

    const cancel = () => {
      reject.value();
      menu.value = false;
    };

    const setDate = () => {
      this.$emit('setDate', momentDate.value);
      menu.value = false;
    };

    const setDateFromExternal = (date) => {
      date.value = date.format('YYYY-MM-DD');
      time.value = date.format('HH:mm');
    };

    return {
      menu,
      date,
      time,
      tab,
      combinedDate,
      momentDate,
      dateValid,
      formattedDate,
      open,
      acceptStake,
      cancel,
      setDate,
      setDateFromExternal
    };
  }
}
</script>

<style scoped>
.deadlink {
  text-decoration: none;
  color: unset!important;
}
</style>
