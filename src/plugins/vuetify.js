// plugins/vuetify.js
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Ensure you are using the new Vuetify 3 style imports

import { aliases, mdi } from 'vuetify/iconsets/mdi';
import themes from './themes.js';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
	styles: {
		configFile: 'src/assets/css/main.scss'
	},
	theme: {
		options: {
			customProperties: true,
		},
		themes: {
			light: themes.theme2.light,
		},
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: {
			mdi,
		},
	},
	breakpoint: {
		thresholds: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1920,
		},
		scrollBarWidth: 24,
	},
	components,
	directives,
});
	

export default vuetify;