import { createRouter, createWebHistory } from 'vue-router';
// import ErrorPage from '@/views/404/Page.vue';

// import ExchangeSwitcher from '@/views/ExchangeSwitcher';
// import Tokens from '@/views/tokens/Page.vue';
// import Token from '@/views/token/Page.vue';
// import Pairs from '@/views/pairs/Page.vue';
// import Pair from '@/views/pair/Page.vue';

// import Lockerv1 from '@/views/lockerv1/Page.vue';
// import LockERC20 from '@/views/locker/erc20/Page.vue';

// import Services from '@/views/services/Page.vue';
const Services = () => import('@/views/services/Page.vue');
const ErrorPage = () => import('@/views/404/Page.vue');
const ExchangeSwitcher = () => import('@/views/ExchangeSwitcher.vue');
const Tokens = () => import('@/views/tokens/Page.vue');
const Token = () => import('@/views/token/Page.vue');
const Pairs = () => import('@/views/pairs/Page.vue');
const Pair = () => import('@/views/pair/Page.vue');
const Lockerv1 = () => import('@/views/lockerv1/Page.vue');
const LockERC20 = () => import('@/views/locker/erc20/Page.vue');
const ChainSwitcher = () => import('@/components/dialogs/chain-switcher-dialog.vue');
const ConnectWalletDialog = () => import('@/web3/connect-dialog.vue');

const routes = [
	// {
	// 	path: '/connect-wallet',
	// 	name: 'ConnectWallet',
	// 	component: ConnectWalletDialog,
	// },
	// {
	// 	path: '/chain-switcher',
	// 	name: 'Chainswitcher',
	// 	component: ChainSwitcher,
	// },
	{
		path: '/token',
		name: 'Lock CW20',
		component: LockERC20,
	},
	{
		path: '/liquidity',
		name: 'Lock LP',
		component: Lockerv1,
	},
	{
		path: '/',
		name: 'Default',
		component: Services,
	},
	{
		path: '/services',
		name: 'Services',
		component: Services,
	},
	{
		path: '/browser',
		name:'ExchangeSwitcher',
		component: ExchangeSwitcher,
		props: true,
		children: [
			// TOKENS
			{
				path: 'tokens',
				name: 'TokensPage',
				component: Tokens,
			},
			{
				path: 'token/:address',
				name: 'Token',
				props: true,
				component: Token,
			},
			{
				path: 'pairs',
				name: 'PairsComponent',
				component: Pairs,
			},
			{
				path: 'pair/:address',
				name: 'Pair',
				props: true,
				component: Pair,
			},
		],
	},

	// {
	// 	path: '/browser/tokens',
	// 	name: 'TokensPage',
	// 	component: Tokens,
	// },
	// {
	// 	path: '/browser/token/:address',
	// 	name: 'Token',
	// 	component: Token,
	// },
	// {
	// 	path: '/browser/pairs',
	// 	name: 'PairsComponent',
	// 	component: Pairs,
	// },
	// {
	// 	path: '/browser/pair/:address',
	// 	name: 'Pair',
	// 	component: Pair,
	// },

	// MISC
	{
		path: '/:catchAll(.*)',
		component: ErrorPage,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { left: 0, top: 0 };
		}
	},
});

export default router;
