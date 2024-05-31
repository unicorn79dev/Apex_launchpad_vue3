<template>
  <v-container style="width: 650px; opacity: 1;" :class="[{'pa-0': isXs}]">
    <div class="border-lg rounded-xl" style="background-color: #0a0815;">
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
