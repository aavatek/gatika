import {
	defineConfig,
	presetMini,
	presetIcons,
	presetAttributify,
	transformerAttributifyJsx,
} from 'unocss';

export default defineConfig({
	presets: [presetMini(), presetIcons(), presetAttributify()],
	transformers: [transformerAttributifyJsx()],
});
