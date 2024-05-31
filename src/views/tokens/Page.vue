<template>
  <v-container style="max-width: 600px;padding: 10px; padding-top: 10px;">
    <div class="rounded-xl" style="background-color: #002;opacity: 0.8;border:1px solid #4a4865;">
      <div>
        <div>
          <all-tokens></all-tokens>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import AllTokens from './all-tokens';
import { useDisplay } from 'vuetify';

const store = useStore();
const tab = ref(0);
const showAdvert = ref(true);

// const { xs: isXs } = useDisplay();
const breakpoint = useDisplay();
const isXs = breakpoint.xs;
</script>
