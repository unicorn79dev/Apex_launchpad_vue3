import { createStore } from 'vuex';
import { reactive } from 'vue';
import themes from '@/plugins/themes.js';
import ConnectProvider from '@/web3/connect-provider';
import SETTINGS from '@/store/settings';

const NETWORK = 'SEI';

export const store = createStore({
	state() {
		return {
			theme: 'theme1',
			requiredNetwork: NETWORK,
			requiredNetworkDisplayName: SETTINGS.CHAIN_DISPLAY_NAME[NETWORK],
			etherscan_url: SETTINGS.ETHERSCAN_URL[NETWORK],
			explorer_name: SETTINGS.EXPLORER_NAME[NETWORK],
			nativeGasTokenSymbol: SETTINGS.NATIVE_GAS_TOKEN_SYMBOL[NETWORK],
			wrongNetwork: false,
			signer: reactive({
				address: null,
				address_condensed: null,
				signedClient: null,
				client: null,
				denom: null,
				watcher: null,
			}),
			ethers: reactive({
				coinbase: null,
				coinbase_condensed: null,
				providerName: null,
				provider: null,
				signer: null,
				network: 1,
				watcher: null,
				walletConnectProvider: null,
				walletLinkProvider: null,
			}),
			pendingTx: reactive({
				pending: [],
				tx: {},
			}),
		};
	},
	mutations: {
		setWrongNetwork(state, flag) {
			state.wrongNetwork = flag;
		},
		switchChain(state, network) {
			state.requiredNetwork = network;
			state.requiredNetworkDisplayName = SETTINGS.CHAIN_DISPLAY_NAME[network];
			state.etherscan_url = SETTINGS.ETHERSCAN_URL[network];
			state.explorer_name = SETTINGS.EXPLORER_NAME[network];
			state.nativeGasTokenSymbol = SETTINGS.NATIVE_GAS_TOKEN_SYMBOL[network];

			ConnectProvider.disconnect();
			ConnectProvider.connectViewOnlyProvider();
		},
		setTheme(state, { themeName }) {
			state.theme = themeName;
			localStorage.setItem('theme', themeName);
		},
		updateEthers(state, payload) {
			state.ethers = Object.assign(state.ethers, payload);
			state.ethers.watcher = state.ethers.coinbase + state.requiredNetwork;
			if ((state.ethers.coinbase || '').length === 42) {
				state.ethers.coinbase_condensed =
					state.ethers.coinbase.slice(0, 6) +
					'...' +
					state.ethers.coinbase.slice(state.ethers.coinbase.length - 4);
			}
		},
		updateClient(state, payload) {
			state.signer = Object.assign(state.signer, payload);
			state.signer.watcher = state.signer.address + state.requiredNetwork;
			if ((state.signer.address || '').length === 42) {
				state.signer.address_condensed =
					state.signer.address.slice(0, 6) +
					'...' +
					state.signer.address.slice(state.signer.address.length - 4);
			}
		},
		addPendingTx(state, txhash) {
			state.pendingTx.pending.push(txhash);

			var item = {
				created: Date.now(),
				txhash: txhash,
				network: state.requiredNetwork,
				state: 'pending',
			};
			state.pendingTx.tx = { ...state.pendingTx.tx, [txhash]: item };
		},
		completePendingTx(state, txhash) {
			state.pendingTx.pending = state.pendingTx.pending.filter(
				(item) => item !== txhash
			);
			state.pendingTx.tx[txhash].state = 'completed';
		},
		failPendingTx(state, txhash) {
			state.pendingTx.pending = state.pendingTx.pending.filter(
				(item) => item !== txhash
			);
			if (state.pendingTx.tx[txhash]) {
				state.pendingTx.tx[txhash].state = 'failed';
			}
		},
	},
	actions: {},
	modules: {},
	getters: {},
});

export default store;
