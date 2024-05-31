const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');

module.exports = {
	pwa: {
		name: 'Apexpad',
		themeColor: '#000000',
		msTileColor: '#000000',
		appleMobileWebAppCapable: 'yes',
		appleMobileWebAppStatusBarStyle: 'black',
		workboxPluginMode: 'InjectManifest',
		workboxOptions: {
			swSrc: './sw.js',
			swDest: 'service-worker.js',
		},
		manifestOptions: {
			name: 'Apexpad',
			icons: [
				{
					src: './img/icons/android-chrome-192x192.png',
					sizes: '192x192',
					type: 'image/png',
				},
				{
					src: './img/icons/android-chrome-512x512.png',
					sizes: '512x512',
					type: 'image/png',
				},
			],
		},
	},
	configureWebpack: {
		plugins: [
			new ProvidePlugin({
				Buffer: ['buffer', 'Buffer'],
				process: 'process/browser',
			}),
			new NodePolyfillPlugin(),
			new DefinePlugin({
				__VUE_OPTIONS_API__: 'true',
				__VUE_PROD_DEVTOOLS__: 'false',
				__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
			}),
		],
		resolve: {
			alias: {
				crypto: 'crypto-browserify',
				stream: 'stream-browserify',
				assert: 'assert',
				http: 'stream-http',
				https: 'https-browserify',
				os: 'os-browserify/browser',
				url: 'url',
			},
			extensions: ['.js', '.vue', '.json'],
			fallback: {
				buffer: require.resolve('buffer/'),
			},
		},
		node: {
			global: true,
			__filename: false,
			__dirname: false,
		},
	},
};
