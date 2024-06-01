<template>
    <v-dialog v-model="dialog" scrollable persistent max-width="450" content-class="br-20" opacity="0.05">
      <v-card class="br-20" style="background-color: #11111f;">
        <div class="d-flex align-center title px-4 py-3 border-b background" style="font-size: 1.3rem;background-color: #111111;">
          <div style="width: 24px;"></div>
          <v-spacer></v-spacer>
          Switch Network
          <v-spacer></v-spacer>
          <v-btn icon color="text" @click="close">
          <!-- <v-btn icon color="text" to="/"> -->
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
  
        <v-card-text class="pa-0">
          <div class="d-flex align-center c-list pa-4 border-b" @click="selectChain('INJ')">
            <img width="50px" class="mr-3 br-20" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg">
            <div>
              <div class="title">
                Injective
              </div>
            </div>
          </div>
  
          <div class="d-flex align-center c-list pa-4" @click="selectChain('SEI')">
            <img width="36px" class="ml-2 mr-5 br-20" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg">
            <div>
              <div class="title">
                Sei
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import { ref, inject } from 'vue';
import { useStore } from 'vuex';
import { RouterView, useRouter } from 'vue-router';

export default {
  name: 'ChainSwitcherDialog',
  // props:{
  //   message: Boolean
  // },
  setup() {
    const message = inject('message');
    // const dialog = ref(false);
    // dialog.value = message.value;
    const dialog = message;
    const store = useStore();
    const router = useRouter();

    const open = () => {
      dialog.value = true;
    }


    const close = () => {
      dialog.value = false;
      console.log(message.value);
    }

    const selectChain = (requiredChain) => {
      store.commit('switchChain', requiredChain);
      close();
    }

    return { dialog, open, close, selectChain }
  }
}
</script>

<style scoped lang="scss">
.draw-icon {
  fill: transparent;
  stroke-width: 5px;

  path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dash 1.5s linear forwards;
    /* animation: dash 5s cubic-bezier(.645,.045,.355,1); */
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
