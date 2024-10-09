import { DEV } from 'solid-js';
import { isServer } from 'solid-js/web';

const dev = DEV && !isServer;
export const logger = {
	info: (msg: string) => {
		if (dev)
			console.log(
				`%c I %c ${msg}`,
				'background: #0066cc; color: white; padding: 2px 4px; border-radius: 2px;',
				'color: inherit',
			);
	},

	error: (msg: string) => {
		if (dev)
			console.log(
				`%c E %c ${msg}`,
				'background: #cc0000; color: white; padding: 2px 4px; border-radius: 2px;',
				'color: inherit',
			);
	},
};
