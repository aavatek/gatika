import { createMemo } from 'solid-js';
import styles from './@.module.css';

type FieldErrorProps = {
	id?: string;
	error?: string;
};

export function FieldError(props: FieldErrorProps) {
	const hidden = createMemo(() => (props.error ? undefined : 'true'));

	return (
		<output id={props.id} aria-hidden={hidden()} class={styles.error}>
			{props.error}
		</output>
	);
}
