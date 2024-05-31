import html2canvas from 'html2canvas';

const VueHtml2Canvas = {
	install(app, options) {
		app.config.globalProperties.$html2canvas = async function (
			el,
			options = {}
		) {
			const { type } = options;
			const canvas = await html2canvas(el, options);
			if (type && type === 'dataURL') {
				return canvas.toDataURL();
			} else {
				console.warn(
					"Vue Html2Canvas Warn: Invalid option type. Use 'dataURL' instead. Returning canvas."
				);
				return canvas;
			}
		};
	},
};

export default VueHtml2Canvas;
