import { defineConfig, presetMini, presetIcons, presetWebFonts } from 'unocss';

export default defineConfig({
	presets: [
		presetMini(),
		presetIcons(),
		presetWebFonts({
			fonts: {
				sans: 'Fira Sans:300',
			},
		}),
	],
});
