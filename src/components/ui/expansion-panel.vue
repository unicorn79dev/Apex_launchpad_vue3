<template>
  <div>
    <div class="cursor-pointer" @click="toggle">
      <slot name="header" :toggle="toggle" :expand="expand"></slot>
    </div>
    <v-expand-transition>
      <template v-if="vshow && expand">
        <!-- The components in here are live and will trigger even when collapsed -->
        <div>
          <slot name="body" :expand="expand"></slot>
        </div>
      </template>
      <template v-else-if="expand">
        <!-- use padding and not margins else you get jerky animations -->
        <div>
          <slot name="body" :expand="expand" :toggle="toggle"></slot>
        </div>
      </template>
    </v-expand-transition>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    expanded: {
      type: Boolean,
      default: false
    },
    vshow: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const expand = ref(props.expanded);

    const toggle = () => {
      expand.value = !expand.value;
    };

    return {
      expand,
      toggle
    };
  }
}
</script>
