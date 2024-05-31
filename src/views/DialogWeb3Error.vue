<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <v-row class="pa-4 ma-0 t-large font-weight-bold align-center">
        Error
        <v-spacer></v-spacer>

        <v-btn @click="close" icon color="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>

      <v-card-text class="pa-6">
        <div class="text-center">
          {{ errorMessage }}
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';

const dialog = ref(false);
const errorMessage = ref('');

const open = (message) => {
  errorMessage.value = message;
  dialog.value = true;
};

const close = () => {
  dialog.value = false;
};
</script>
