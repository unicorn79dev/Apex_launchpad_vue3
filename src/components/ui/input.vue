<template>
  <div class="c-input">
    <input 
      :type="type" 
      :placeholder="placeholder"
      v-model="innerValue"
      @focus="onFocus"
      @blur="onBlur"
      style="text-overflow: ellipsis;"
      :class="contentClass"
      spellcheck="false">
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    value: null,
    label: null,
    placeholder: null,
    focussed: {
      default: false
    },
    type: {
      type: String,
      default: 'text'
    },
    contentClass: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const localFocussed = ref(false);
    const innerValue = ref(props.value);

    const onFocus = (event) => {
      event.target.select();
      localFocussed.value = true;
    };

    const onBlur = (event) => {
      emit('blur', event);
      localFocussed.value = false;
    };

    watch(innerValue, (newValue) => {
      emit('update:value', newValue);
      if (localFocussed.value) {
        emit('updateWhileFocussed', newValue);
      }
    });

    watch(localFocussed, (newValue) => {
      emit('update:focussed', newValue);
    });

    return {
      innerValue,
      onFocus,
      onBlur
    };
  }
}
</script>
