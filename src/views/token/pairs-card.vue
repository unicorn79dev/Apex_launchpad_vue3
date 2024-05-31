<template>
  <div>
    <div>
      <pair-row
      v-for="item of pairs" 
      :key="item.address"
      :item="item"
      class="border-b">
      </pair-row>
    </div>

    <!-- PAGINATION -->
    <v-btn v-if="nextPageExists" v-scroll="onScroll" depressed block @click="nextPage" class="ma-2">
      <v-progress-circular
      v-if="loading"
      indeterminate
      size="20"
      width="2"
      color="primary">
      </v-progress-circular>
      <template v-else>
        Show More
      </template>
    </v-btn>
    <!-- PAGINATION -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import _ from 'lodash';
import PairRow from '@/views/pairs/row';

const props = defineProps({
  address: {
    type: String,
  },
});

const pairs = ref([]);
const page = ref(0);
const filters = ref({
  rowsPerPage: 20,
  sort: 'lock_value',
  sortAscending: false,
});
const nextPageExists = ref(false);
const loading = ref(false);

const onScroll = (e) => {
  if (typeof window === 'undefined') return;
  if ((window.innerHeight + window.pageYOffset) >= document.body.scrollHeight - 10) {
    nextPage();
  }
};

const nextPage = _.debounce(async () => {
  page.value++;
  const response = await APIFetchPairs();
  const rows = response.data.rows;
  pairs.value.push(...rows);
  nextPageExists.value = rows.length === 30;
}, 500, { trailing: true });

const normalLoad = _.debounce(async () => {
  const response = await APIFetchPairs();
  const rows = response.data.rows;
  pairs.value = rows;
  nextPageExists.value = rows.length === 30;
}, 300, { leading: true });

const APIFetchPairs = () => {
  return new Promise((resolve, reject) => {
    // Uncomment and use actual API call
    // loading.value = true;
    // this.$axios.post(`/uniswap/token/${props.address}/pairs`, { filters: filters.value, page: page.value })
    //   .then(response => {
    //     resolve(response);
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     reject(error);
    //   })
    //   .finally(() => {
    //     loading.value = false;
    //   });
  });
};

onMounted(() => {
  normalLoad();
});
</script>
