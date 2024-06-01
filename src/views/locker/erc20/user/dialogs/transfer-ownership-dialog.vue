<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Transfer ownership
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">
          Transfer this lock to a new owner
        </div>
        <div class="caption">
          The specified address will be able to withdraw the tokens once the unlock date is reached.
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <c-input v-model:value="unlockerAccount" placeholder="New owner address...">
          </c-input>
        </div>

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large block rounded depressed @click="transferLockOwnership" class="white--text grad-green" :loading="withdrawLoading">
          Transfer
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import CInput from '@/components/ui/input';
import SETTINGS from '@/store/settings';
import Utils from '@/web3/utils';


const dialog = ref(false);
const unlockerAccount = ref('');
const loading = ref(false);
const withdrawLoading = ref(false);
const lock = ref({});

const sClient = () => {
  return $store.state.signer;
};

const reqNetwork = () => {
  return $store.state.requiredNetwork;
};

const open = (lockData) => {
  lock.value = lockData;
  dialog.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
};

const cancel = () => {
  rejectPromise();
  dialog.value = false;
};

const transferLockOwnership = async () => {
  withdrawLoading.value = true;
  const CONTRACT_ADDRESS = SETTINGS.CHAINS[reqNetwork()].tokenLocker;
  const defaultFee = SETTINGS.CHAINS[reqNetwork()].defaultFee;

  $root.$dialog.confirmTx.open();
  try {
    const txhash = await sClient().signedClient.execute(
      sClient().address,
      CONTRACT_ADDRESS,
      {
        "transfer_lock_ownership": {
          "lockid": lock.value.lock_id,
          "new_owner": unlockerAccount.value
        }
      },
      defaultFee,
      undefined,
      []
    );

    $root.$dialog.confirmTx.close();

    resolvePromise();
    dialog.value = false;

    console.log("lock txhash: ", txhash);
  } catch (err) {
    console.log(err);
    $root.$dialog.confirmTx.close();
    $root.$dialog.web3Error.open(err.message);
  }

  withdrawLoading.value = false;
};

</script>
