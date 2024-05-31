<template>
  <div
    outlined
    :class="[
      'c-list', 
      { 'pa-4 border-b br-0 foreground': isXs }, 
      { 'pa-4 border-b': !isXs }
    ]"
    @click="goToTokenPage"
    style="position: relative;"
  >
    <v-icon size="60" class="watermark" style="position: absolute; left: 260px; top: 100px;">mdi-lock-outline</v-icon>
    
    <div style="position: relative;">
      <div style="word-break: break-word;">
        <div class="d-flex align-center">
          <coin-icon :address="item.address" :url="item.icon_url" class="mr-2" :size="22"></coin-icon>
          <div text class="title pa-0 font-weight-bold" style="min-width: 10px;">
            <span class="text-truncate" :style="isXs ? 'max-width: 10ch;' : 'max-width: 20ch;'">
              {{ `${item.symbol} / ${item.name}` }}
            </span>
          </div>

          <v-spacer></v-spacer>
          <div :class="['font-weight-medium']">
            {{ item.address.slice(0, 8) + '...' + item.address.slice(item.address.length - 4) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: null
  }
});

// Setup Router
const router = useRouter();

// Use Vuetify's useDisplay composable
// const { xs } = useDisplay();
const breakpoint = useDisplay();
// const isXs = breakpoint.xs;
const isXs = computed(() => breakpoint.xs.value);

// Methods
const goToTokenPage = () => {
  router.push(`/browser/token/${props.item.address}`);
  // this.$emit('on-close');
};
</script>
