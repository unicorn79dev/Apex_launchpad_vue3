<template>
  <div>
    <div ref="chartContainer" style="position: relative;">
      <div ref="tooltip" class="floating-tooltip-2" style="visibility: hidden;">
        <div>
          {{ hoverPrice }}
        </div>
        <div>
          {{ hoverDate }}
        </div>
      </div>

      <div v-if="loading" class="text-center" style="position:absolute; left: 0; right: 0; top: 40px;">
        <v-progress-circular indeterminate size="60" width="2" color="#aaa">
          <img :src="require('@/assets/img/APEX.png')" height="40px" class="greyscale" width="40px">
        </v-progress-circular>
      </div>

      <div v-if="!loading && errorLoadingChart" class="textFaint--text text-center" style="position:absolute; left: 0; right: 0; bottom: 0; top: 60px;">
        Error loading chart
      </div>
    </div>
    <div class="d-flex align-center px-2">
      <v-btn v-if="pairName" @click="microWrapper" rounded outlined small :color="tab === 0 ? 'text' : 'textFaint'">
        {{ pairName }}
      </v-btn>
      <v-btn @click="oneDayWrapper" rounded outlined small :color="tab === 1 ? 'text' : 'textFaint'">
        $ Macro
      </v-btn>
      <v-spacer></v-spacer>
      <div class="t-small d-flex align-center textFaint--text">
        Charts by TradingView
        <v-menu offset-y open-on-hover transition="scale-transition" max-width="300px">
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" @click.stop size="14" v-on="on" color="textFaint" class="ml-1">
              mdi-help-circle-outline
            </v-icon>
          </template>
          <div class="pa-3 foreground caption">
            TradingView Lightweight Charts <br />
            Copyright (с) 2020 TradingView, Inc.
            <a href="https://www.tradingview.com/" target="_blank">
              https://www.tradingview.com/
            </a>
          </div>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { createChart } from 'lightweight-charts';

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    default: null
  }
});

const store = useStore();
const tab = ref(0);
const cdata = ref([]);
const chart = ref(null);
const chartData = ref(null);
const hoverPrice = ref(0);
const hoverDate = ref('');
const pairName = ref('');
const loading = ref(false);
const errorLoadingChart = ref(false);

const cExchange = computed(() => props.exchange || store.state.exchange);

const oneDayWrapper = async () => {
  loading.value = true;
  tab.value = 1;
  errorLoadingChart.value = false;
  try {
    await oneDay();
  } catch (e) {
    errorLoadingChart.value = true;
  } finally {
    loading.value = false;
  }
};

const microWrapper = async () => {
  loading.value = true;
  tab.value = 0;
  errorLoadingChart.value = false;
  try {
    await micro();
  } catch (e) {
    errorLoadingChart.value = true;
  } finally {
    loading.value = false;
  }
};

const oneDay = async () => {
  // Implementation here
};

const micro = async () => {
  // Implementation here
};

const getPairNames = async () => {
  // Implementation here
};

const makeChart = () => {
  const width = 500;
  const height = 200;
  chart.value = createChart(chartContainer.value, {
    width: width,
    height: height,
    layout: {
      textColor: '#d1d4dc',
      backgroundColor: '#ff000000',
    },
    crosshair: {
      vertLine: {
        width: 5,
        color: 'rgba(224, 227, 235, 0.1)',
        style: 0,
      },
      horzLine: {
        visible: true,
        labelVisible: true,
      },
    },
    grid: {
      vertLines: {
        color: 'rgba(42, 46, 57, 0)',
      },
      horzLines: {
        color: 'rgba(42, 46, 57, 0)',
      },
    },
  });

  chartData.value = chart.value.addAreaSeries({
    priceScaleId: 'right',
    topColor: 'rgba(14, 207, 114, 0.56)',
    bottomColor: 'rgba(14, 207, 114, 0.04)',
    lineColor: 'rgba(14, 207, 114, 1)',
    lineWidth: 2,
    scaleMargins: {
      top: 0.1,
      bottom: 0.3,
    },
  });

  const toolTipWidth = 100;
  const toolTipHeight = 80;
  const toolTipMargin = 15;
  const toolTip = ref(null);

  chart.value.subscribeCrosshairMove(param => {
    if (!param.time || param.point.x < 0 || param.point.x > width || param.point.y < 0 || param.point.y > height) {
      toolTip.value.style.display = 'none';
      return;
    }

    toolTip.value.style.display = 'block';
    hoverPrice.value = param.seriesPrices.get(chartData.value);
    hoverDate.value = param.time;
    let left = param.point.x + toolTipMargin;
    if (left > width - toolTipWidth) {
      left = param.point.x - toolTipMargin - toolTipWidth;
    }

    let top = param.point.y + toolTipMargin;
    if (top > height - toolTipHeight) {
      top = param.point.y - toolTipHeight - toolTipMargin;
    }

    toolTip.value.style.left = left + 'px';
    toolTip.value.style.top = top + 'px';
  });
};

onMounted(() => {
  oneDayWrapper();
  getPairNames();
  makeChart();
});
</script>

<style scoped lang="scss">
.floating-tooltip-2 {
  width: 96px;
  height: 80px;
  position: absolute;
  display: none;
  padding: 8px;
  box-sizing: border-box;
  font-size: 12px;
  color: #131722;
  background-color: rgba(255, 255, 255, 1);
  text-align: left;
  z-index: 1000;
  top: 12px;
  left: 12px;
  pointer-events: none;
  border: 1px solid rgba(255, 70, 70, 1);
  border-radius: 2px;
}
</style>
