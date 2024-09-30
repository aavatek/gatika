import { FieldError } from './FieldError';
import { FieldLabel } from './FieldLabel';
import { createMemo, splitProps } from 'solid-js';
import type { ComponentProps } from 'solid-js';
import styles from './@.module.css';

export type InputFieldProps = {
	label: string;
	error?: string;
	value?: string | Date | number;
} & Omit<ComponentProps<'input'>, 'value'>;

export function InputField(props: InputFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);

	const getValue = createMemo(() => {
		switch (true) {
			case props.value == null:
				return String();
			case props.type === 'date' && props.value instanceof Date:
				return props.value.toISOString().split('T')[0];
			case props.type === 'number' && typeof props.value === 'number':
				return props.value.toString();
			default:
				return String(props.value);
		}
	});

	const getErrorId = createMemo(() =>
		props.error ? `${props.name}-error` : undefined,
	);

	return (
		<div class={styles.formField}>
			<FieldLabel
				name={props.name}
				label={props.label}
				required={props.required}
			/>

			<input
				{...inputProps}
				id={props.name}
				value={getValue()}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={getErrorId()}
				class={styles.input}
			/>

			<FieldError id={getErrorId()} error={props.error} />
		</div>
	);
}
