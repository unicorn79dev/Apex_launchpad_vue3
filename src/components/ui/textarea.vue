<template>
  <div class="c-textarea">
    
    <textarea 
    :type="type" 
    :placeholder="placeholder"
    v-model="innerValue"
    @focus="onFocus"
    @blur="onBlur"
    :class="contentClass"
    spellcheck="false"
    :rows="rows">
    </textarea>

  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {
    value: null,
    label: null,
    placeholder: null,
    focussed: {
      default: false
    },
    rows: {
      type: String,
      default: "3"
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

    const updateValue = (nv) => {
      innerValue.value = nv;
      emit('update:value', nv);
      if (localFocussed.value) {
        emit('updateWhileFocussed', nv);
      }
    };

    watch(localFocussed, (nv) => {
      emit('update:focussed', nv);
    });

    return {
      innerValue: computed(() => innerValue.value),
      onFocus,
      onBlur
    };
  }
}
</script>
