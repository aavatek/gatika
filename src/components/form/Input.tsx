import type { ComponentProps } from 'solid-js';
import { createMemo, createUniqueId, splitProps } from 'solid-js';
import { formatDate } from '@solid-primitives/date';
import { FieldLabel, FieldError } from './Field';
import styles from './@.module.css';

export type InputFieldProps = {
	label: string;
	error?: string;
	value?: string | number | Date;
} & Omit<ComponentProps<'input'>, 'value'>;

export function InputField(props: InputFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);

	const value = createMemo(() => {
		switch (true) {
			case props.value == null:
				return String();
			case props.value instanceof Date && !Number.isNaN(props.value.getTime()):
				return formatDate(props.value);
			default:
				return String(props.value);
		}
	});

	const id = createUniqueId();
	const errorId = createMemo(() => (props.error ? `${id}-error` : undefined));

	return (
		<div class={styles.formField}>
			<FieldLabel for={id} label={props.label} required={props.required} />

			<input
				{...inputProps}
				id={id}
				value={value()}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={errorId()}
				class={styles.input}
			/>

			<FieldError id={errorId()} error={props.error} />
		</div>
	);
}
