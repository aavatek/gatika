import type { ComponentProps } from 'solid-js';
import { createMemo, splitProps } from 'solid-js';
import { formatDate, getDate } from '@solid-primitives/date';
import { FieldLabel, FieldError } from './Field';
import styles from './@.module.css';

export type InputFieldProps = {
	label: string;
	error?: string;
	value?: string | number | Date;
} & Omit<ComponentProps<'input'>, 'value'>;

export function InputField(props: InputFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);

	const getValue = createMemo(() => {
		switch (true) {
			case props.value == null:
				return String();
			case props.value instanceof Date && !Number.isNaN(props.value.getTime()):
				return formatDate(props.value);
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
