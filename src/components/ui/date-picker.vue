<template>
  <div class="d-flex justify-space-around">
    <v-menu>
      <template v-slot:activator="{ props: menu }">
            <v-btn
              color="primary"
              v-bind="mergeProps(menu)"
            >
            <v-icon :color="color">mdi-calendar</v-icon>
            <v-icon small :color="color">mdi-chevron-down</v-icon>
            </v-btn>
      </template>
     
      <v-card class="pa-0">
        <v-tabs v-model="tab" background-color="transparent" color="basil" grow>
          <v-tab value="date">
            Date
          </v-tab>
          <v-tab value="time">
            Time
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="date">
            <v-date-picker v-model="date" class=""></v-date-picker>
          </v-tabs-window-item>

          <v-tabs-window-item value="time">
            <v-time-picker v-model="time" format="24hr"></v-time-picker>
          </v-tabs-window-item>
        </v-tabs-window>

        <div class="text-center pt-2">
          {{ formattedDate }}
        </div>

        <div class="pa-2">
          <v-btn @click="setDate" x-large rounded block color="primary" :disabled="!dateValid">
            Accept
          </v-btn>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>


<script>
import { ref, computed } from 'vue';
import moment from 'moment';
import { mergeProps } from 'vue'

export default {
  methods: {
    mergeProps,
  },
  setup() {
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
            return new Promise((res, rej) => {
        resolve.value = res;
        reject.value = rej;
      });
    };

    const acceptStake = () => {
      resolve.value();
      
    };

    const cancel = () => {
      reject.value();
      
    };

    const setDate = () => {
      this.$emit('setDate', momentDate.value);
      
    };

    const setDateFromExternal = (date) => {
      date.value = date.format('YYYY-MM-DD');
      time.value = date.format('HH:mm');
    };

    return {
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