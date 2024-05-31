<template>
  <div>
    <div v-if="false">
      {{ netIdentifier }}
    </div>
    <Disqus ref="disqus" :page-config="pageConfig" shortname="unicrypt-network" /> 
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { Disqus } from 'vue-disqus'

export default {
  props: {
    identifier: {
      type: String,
      default: ''
    }
  },

  components: {
    Disqus
  },

  setup(props) {
    const netIdentifier = computed(() => `${state.requiredNetwork}_${props.identifier}`)
    const pageConfig = ref({ identifier: netIdentifier.value })

    const theme = computed(() => state.theme)

    watch(theme, () => {
      reset()
    })

    const reset = () => {
      disqus.value.reset()
    }

    return { netIdentifier, pageConfig, reset }
  }
}
</script>
