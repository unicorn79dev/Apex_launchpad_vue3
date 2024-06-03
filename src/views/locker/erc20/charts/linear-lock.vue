<template>
  <div>
    <div class="d-flex justify-center mt-2">
      <div style="width: 100%;">
        <!-- <line-chart :chartdata="chartData" :options="chartOptions" ref="lineChart" /> -->
        <!-- <BarChart :chartdata="chartData" :options="chartOptions" /> -->
        <Line :chart-data="chartData" :options="chartOptions"/>
      </div>
    </div>
    
    <div class="pa-2">
      <div class="text-center">
        Tokens withdrawable
      </div>
      <div class="d-flex align-center">
        Per day: 
        <v-spacer></v-spacer>
        {{ amountWithdrawablePerDayHuman }}
      </div>
      <div class="d-flex align-center">
        Per month: 
        <v-spacer></v-spacer>
        {{ amountWithdrawablePerMonthHuman }}
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { ethers } from 'ethers';
import moment from 'moment';
// import LineChart from '@/components/charts/line';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)


export default {
  props: {
    lock: {
      type: Object,
      default: () => {}
    },
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
  },


  components: {
    // LineChart,
    // BarChart
    Line
  },
  data(){
    return {
      test_data : {
      labels: [
        'labels1',
        'labels1',
        'labels1',
        'labels1',
        'labels1',
        'labels1',
        'labels1',
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
    }
  },
  
  setup(props) {
    // const chartData = ref({
    //   labels: [],
    //   datasets: [{
    //     label: 'Tokens Withdrawable',
    //     data: [
    //     65, 59, 80, 81, 56, 55, 40
    //     ],
    //     fill: false,
    //     borderWidth: 2,
    //     borderColor: 'rgb(33, 150, 243)',
    //     tension: 0,
    //   }]
    // });
    const chartData = reactive({
      labels: [],
      datasets: [{
        label: 'Tokens Withdrawable',
        data: [],
        fill: false,
        borderWidth: 2,
        borderColor: 'rgb(33, 150, 243)',
        tension: 0
      }]
    });

    const chartOptions = ref({
      responsive: true,
      interaction: {
        intersect: false
      },
      scales: {
        xAxes: [{
          type: 'time'
        }]
      },
      plugins: {
        tooltip: {
          enabled: false,
          position: 'average'
        }
      }
    });

    const unlockPeriodInSeconds = computed(() => props.lock.end_emission - props.lock.start_emission);
    const amountWithdrawablePerMinite = computed(() => ethers.BigNumber.from(props.lock.amount).mul(60).div(unlockPeriodInSeconds.value).toString());
    const amountWithdrawablePerHour = computed(() => ethers.BigNumber.from(props.lock.amount).mul(3600).div(unlockPeriodInSeconds.value).toString());
    const amountWithdrawablePerDay = computed(() => ethers.BigNumber.from(props.lock.amount).mul(86400).div(unlockPeriodInSeconds.value).toString());
    const amountWithdrawablePerMonth = computed(() => ethers.BigNumber.from(props.lock.amount).mul(2592000).div(unlockPeriodInSeconds.value).toString());

    const amountWithdrawablePerMonthHuman = computed(() => {
      const amount = ethers.BigNumber.from(amountWithdrawablePerMonth.value).gt(props.lock.amount) ? props.lock.amount : amountWithdrawablePerMonth.value;
      return formatAmount(amount, props.tokenHydrated.decimals);
    });

    const amountWithdrawablePerDayHuman = computed(() => {
      const amount = ethers.BigNumber.from(amountWithdrawablePerDay.value).gt(props.lock.amount) ? props.lock.amount : amountWithdrawablePerDay.value;
      return formatAmount(amount, props.tokenHydrated.decimals);
    });

    const formatAmount = (amount, decimals) => {
      return ethers.utils.formatUnits(amount, decimals);
    };

    const refresh = () => {
      if (props.lock.start_emission >= props.lock.end_emission) {
        return;
      }

      let data = [
        {
          t: moment().unix() * 1000,
          y: 0
        },
        {
          t: props.lock.start_emission * 1000,
          y: 0
        }
      ];

      if (moment().unix() > props.lock.start_emission) {
        data = [
          {
            t: props.lock.start_emission * 1000,
            y: 0
          }
        ];
      }

      let currentEpoch = props.lock.start_emission;
      let totalAmount = ethers.BigNumber.from(0);
      let SCALE = 60; // minute ticks
      let AMOUNT_INCREMENT = amountWithdrawablePerMinite.value;

      if (unlockPeriodInSeconds.value > 3600 * 24 * 30 * 2) {
        SCALE = 2592000; // monthly ticks
        AMOUNT_INCREMENT = amountWithdrawablePerMonth.value;
      } else if (unlockPeriodInSeconds.value > 3600 * 24 * 2) {
        SCALE = 86400; // daily ticks
        AMOUNT_INCREMENT = amountWithdrawablePerDay.value;
      } else if (unlockPeriodInSeconds.value > 3600 * 4) {
        SCALE = 3600; // hourly ticks
        AMOUNT_INCREMENT = amountWithdrawablePerHour.value;
      }

      while (currentEpoch < props.lock.end_emission) {
        currentEpoch += SCALE;
        totalAmount = totalAmount.add(AMOUNT_INCREMENT);


        if (currentEpoch >= props.lock.end_emission) {
          data.push({
            t: props.lock.end_emission * 1000,
            y: ethers.utils.formatUnits(props.lock.amount, props.tokenHydrated.decimals)
          });
          break;
        }

        data.push({
          t: currentEpoch * 1000,
          y: ethers.utils.formatUnits(totalAmount, props.tokenHydrated.decimals)
        });
      }

      // console.log('======================>chartdata', data, data['y'], data[0])

      // chartData.value.datasets[0].data = data.map(item => {
      //   return item.y;
      // });
      // chartData.value.datasets[0].labels = data.map(item => {
      //   return item.t;
      // });

      chartData.datasets[0].data = data.map(item => {
        return item.y;
      });
      chartData.labels = data.map(item => {
        const date = new Date(item.t)
        const form_date = moment(date).format("YYYY-MM-DD")
        console.log(form_date)
        return new Date(form_date);
      });
      console.log('======================>chartdata', chartData.datasets[0].data, chartData.labels, chartData)

      
      // lineChartRef.value.update();
    };

    // const lineChartRef = ref(null);

    onMounted(() => {
      refresh();
    });

    watch(() => props.lock, () => {
      refresh();
    }, { deep: true });

    return {
      chartData,
      chartOptions,
      amountWithdrawablePerDayHuman,
      amountWithdrawablePerMonthHuman,
      // lineChartRef,
      refresh
    };
  }
};
</script>
<style scoped>
.pa-2 {
  padding: 0.5rem;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-center {
  text-align: center;
}

.v-spacer {
  flex: 1 1 auto;
}
</style>


