import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import * as sx from '@stylexjs/stylex';
import { Button } from '@components/Form';

export const notificationMsg = {
	taskCreated: 'Tehtävä luotu onnistuneesti',
	taskEdited: 'Tehtävä tallennettu onnistuneesti',
	taskDeleted: 'Tehtävä poistettu onnistuneesti',

	projectCreated: 'Projekti luotu onnistuneesti',
	projectEdited: 'Projekti tallennettu onnistuneesti',
	projectDeleted: 'Projekti poistettu onnistuneesti',

	unexpectedError: 'Jokin meni pieleen',
};

type Notification = {
	variant: 'error' | 'warning' | 'success';
	message: (typeof notificationMsg)[keyof typeof notificationMsg];
	description?: string;
};

export const [notification, setNotification] = createSignal<Notification>();

export const Notification = () => {
	const [seconds, setSeconds] = createSignal(0);

	createEffect(() => {
		if (notification()) {
			setSeconds(3);
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
						{...sx.props(
							style.notificationWrapper,
							style[notification().variant],
						)}
					>
						<Button
							label="x"
							type="button"
							variant="link"
							onClick={() => setNotification(undefined)}
							extraStyle={style.closeButton}
						/>
						<p {...sx.props(style.notificationMsg)}>{notification().message}</p>
						<p>{notification().description}</p>
					</output>
				</Portal>
			)}
		</Show>
	);
};

const style = sx.create({
	notificationWrapper: {
		width: '320px',
		position: 'fixed',
		bottom: '1rem',
		right: '2rem',
		border: '2px solid black',
		padding: '0.75rem',
		background: 'white',
		display: 'grid',
		gridTemplateRows: 'auto auto auto',
		justifyItems: 'center',
		transition: 'all .5s allow-discrete',

		'@starting-style': {
			bottom: '0rem',
			display: 'hidden',
		},
	},

	closeButton: {
		justifySelf: 'end',
		lineHeight: '.5rem',
		cursor: 'pointer',
		fontSize: '1.1rem',
	},

	notificationMsg: {
		fontSize: '1.35rem',
		padding: '1rem',
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
