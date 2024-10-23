import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import * as sx from '@stylexjs/stylex';
import { Heading } from '@components/Layout';

type Notification = {
	variant: 'error' | 'warning' | 'success';
	title: string;
	description: string;
};

export const [notification, setNotification] = createSignal<Notification>();

export const Notification = () => {
	const [seconds, setSeconds] = createSignal(0);

	createEffect(() => {
		if (notification()) {
			setSeconds(2);
			const timer = setInterval(() => {
				setSeconds(seconds() - 1);

				if (seconds() === 0) {
					clearInterval(timer);
					setNotification(undefined);
					return;
				}
			}, 1000);

			onCleanup(() => clearInterval(timer));
		}
	});

	return (
		<Show when={notification()}>
			{(notification) => (
				<Portal>
					<output
						{...sx.props(style.notification, style[notification().variant])}
					>
						<Heading content={notification().title} level="h3" />
						<p>{notification().description}</p>
					</output>
				</Portal>
			)}
		</Show>
	);
};

const style = sx.create({
	notification: {
		width: '320px',
		position: 'absolute',
		bottom: '2rem',
		left: '2rem',
		border: '2px solid black',
		padding: '1rem',
		background: 'white',
	},

	success: {
		background: '#e8f5e9',
		color: '#1b5e20',
		border: ' 2px solid #1b5e20',
	},

	warning: {
		background: '#fff8e1',
		color: '#ff6f00',
		border: '2px solid #ff6f00',
	},

	error: {
		background: '#ffebee',
		color: '#b71c1c',
		border: '2px solid #b71c1c',
	},
});
