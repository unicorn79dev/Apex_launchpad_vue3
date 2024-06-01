<template>
  <img 
    :src="require(`${srcUrl}`)" 
    :height="`${size}px`"
    :width="`${size}px`"
    @error="setAltImg"
    style="border-radius: 500px;"
  />
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    address: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 30
    },
    url: {
      type: String,
      default: null
    },
    network: null
  },

  setup(props, { emit }) {
    const coinMap = ref({
      'Matic': {
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png',
        // add other mappings...
      },
      'xDai': {
        // add mappings...
      },
      'BSC_MAINNET': {
        // add mappings...
      }
    });

    const srcUrl = computed(() => {
      let network = props.network || 'Matic'; // Default to Matic if network is not provided
      if (coinMap.value[network]) {
        return props.url ? props.url : coinMap.value[network][props.address] || '';
      }
      return props.url ? props.url : '';
    });

    const setAltImg = (event) => {
      let network = props.network || 'Matic'; // Default to Matic if network is not provided
      let overrideIcon = (coinMap.value[network] || {})[props.address];
      if (overrideIcon) {
        event.target.src = overrideIcon;
      } else {
        event.target.src = require('@/assets/img/no-icon.png');
      }
    };

    return {
      srcUrl,
      setAltImg
    };
  }
}
</script>
