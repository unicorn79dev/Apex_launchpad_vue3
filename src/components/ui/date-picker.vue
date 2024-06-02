<template>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      offset-y>
      <template v-slot:activator="{ props: menuProps }">
            <v-btn
              color="primary"
              v-bind="mergeProps(menuProps)"
            >
            <v-icon :color="color">mdi-calendar</v-icon>
            <v-icon small :color="color">mdi-chevron-down</v-icon>
            </v-btn>
      </template>
     
      <v-card class="pa-0">
        <v-tabs v-model="tab" background-color="transparent" color="basil" grow>
          <v-tab>
            Date
          </v-tab>
          <v-tab>
            Time
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="dateTab">
            <v-date-picker v-model="dateData" class=""></v-date-picker>
          </v-tabs-window-item>

          <v-tabs-window-item value="timeTab">
            <v-time-picker v-model="timeData" format="24hr"></v-time-picker>
          </v-tabs-window-item>
        </v-tabs-window>

        <div class="text-center pt-2">
          {{ combinedDate }}
        </div>

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
import { mergeProps } from 'vue'
import { VTimePicker } from 'vuetify/lib/labs/components.mjs';

export default {
  components: {
    VTimePicker,
  },
  methods: {
    mergeProps,
  },
  setup(_, { emit }) {
  // setup() {

    const resolve = ref(null);
    
    const reject = ref(null);
    const dateData = ref(null);
    const timeData = ref('');
    const tab = ref(0);
    const menu = ref(false);

    const dateTyped = computed(() => moment(dateData.value).format("YYYY-MM-DD"));
    const timeTyped = computed(() => timeData.value);
    const combinedDate = computed(() => `${dateTyped.value} ${timeTyped.value}`);
    // const combinedDate = computed(() => `${dateData.value} ${timeData.value}`);
    const momentDate = computed(() => moment(combinedDate.value,'YYYY-MM-DD HH:mm'));
    const dateValid = computed(() => combinedDate);
    const formattedDate = computed(() => momentDate.value.format('ddd, MMM D, HH:mm'));
    // console.log('emit', combinedDate)

    const open = () => {
      return new Promise((res, rej) => {
        resolve.value = res;
        reject.value = rej;
      });
    };

    const acceptStake = () => {
      resolve.value();
      menu.value=false;
    };

    const cancel = () => {
      reject.value();
      menu.value=false;
    };

    const setDate = () => {
      console.log(momentDate.value)
      emit('setDate', moment(momentDate.value));
      menu.value=false;
    };

    const setDateFromExternal = (dateData) => {
      dateData.value = dateData.format('YYYY-MM-DD');
      timeData.value = dateData.format('HH:mm');
    };

    return {
      menu,
      timeData,
      tab,
      combinedDate,
      momentDate,
      dateValid,
      formattedDate,
      dateData,
      dateTyped,
      timeTyped,
      open,
      acceptStake,
      cancel,
      setDate,
      setDateFromExternal,
      mergeProps
    };
  }
}
</script>

<style scoped>
.deadlink {
  text-decoration: none;
  color: #0000ff!important;
}
</style>



<!-- <template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    >
    <template v-slot:activator="{ props: menuProps }">
      <v-btn depressed v-bind="mergeProps(menuProps)">
          <v-icon :color="color">mdi-calendar</v-icon>
          <v-icon small :color="color">mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-card class="pa-0">
      <v-tabs
      v-model="tab"
      background-color="transparent"
      color="basil"
      grow
      >
        <v-tab>
          Date
        </v-tab>
        <v-tab>
          Time
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-dateData-picker
          v-model="date"
          class=""
          ></v-date-picker>
        </v-tab-item>

        <v-tab-item>
          <v-time-picker v-model="time" format="24hr"></v-time-picker>
        </v-tab-item>
      </v-tabs-items>

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
</template>

<script>
import moment from 'moment'
import { mergeProps } from 'vue';
import { VTimePicker } from 'vuetify/lib/labs/components.mjs';

export default {
  components: {
    VTimePicker,
  },
  methods: {
    mergeProps,
  },
  props: {
    color: {
      type: String,
      default: 'primary'
    }
  },
  setup(_, { emit }) {
    const resolve = ref(null);
    
    const reject = ref(null);
    const date = ref("2024-06-01");
    const time = ref("12:00");
    const tab = ref(0);
    const menu = ref(false);

    const combinedDate = computed(() => `${date.value}${time.value}`);
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
      menu.value=false;
    };

    const cancel = () => {
      reject.value();
      menu.value=false;
    };

    const setDate = () => {
      emit('setDate', momentDate.value);
      menu.value=false;
    };

    const setDateFromExternal = (date) => {
      date.value = date.format('YYYY-MM-DD');
      time.value = date.format('HH:mm');
    };

    return {
      menu,
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
      setDateFromExternal,
      mergeProps
    };
  }
}
</script> -->