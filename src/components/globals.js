import { createApp } from 'vue';

// UI COMPONENTS
import ExpansionPanel from '@/components/ui/expansion-panel.vue';
import CInput from '@/components/ui/input.vue';
import CTextArea from '@/components/ui/textarea.vue';
import CoinIcon from '@/components/ui/coin-icon.vue';
import CPagination from '@/components/ui/pagination/pagination.vue';
import CopyAddress from '@/components/ui/copy-address.vue';
import ENMT from '@/components/ui/enmt.vue';

const app = createApp({});

// UI COMPONENTS
app.component('expansion-panel', ExpansionPanel);
app.component('c-input', CInput);
app.component('c-textarea', CTextArea);
app.component('coin-icon', CoinIcon);
app.component('c-pagination', CPagination);
app.component('copy-address', CopyAddress);
app.component('enmt-badge', ENMT);

export default app;
