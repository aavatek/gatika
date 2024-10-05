import { createMemo } from 'solid-js';
import styles from './@.module.css';

type FieldLabelProps = {
	for: string;
	label: string;
	required?: boolean;
};

export const FieldLabel = (props: FieldLabelProps) => {
	return (
		<label for={props.for} class={styles.label}>
			{props.label}
			{props.required && <span aria-hidden="true"> *</span>}
		</label>
	);
};

type FieldErrorProps = {
	id?: string;
	error?: string;
};

export const FieldError = (props: FieldErrorProps) => {
	const hidden = createMemo(() => (props.error ? undefined : 'true'));

	return (
		<output id={props.id} aria-hidden={hidden()} class={styles.error}>
			{props.error}
		</output>
	);
};
