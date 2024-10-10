import type { ComponentProps } from 'solid-js';
import { createMemo, createUniqueId, splitProps } from 'solid-js';
import { FieldLabel, FieldError } from './Field';

export type InputFieldProps = {
	label: string;
	error?: string;
	value?: string | number;
} & Omit<ComponentProps<'input'>, 'value'>;

export function InputField(props: InputFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);

	const value = createMemo(() => {
		switch (true) {
			case props.value == null:
				return String();
			default:
				return String(props.value);
		}
	});

	const id = createUniqueId();
	const errorId = createMemo(() => (props.error ? `${id}-error` : undefined));

	return (
		<div>
			<FieldLabel for={id} label={props.label} required={props.required} />

			<input
				{...inputProps}
				id={id}
				value={value()}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={errorId()}
			/>

			<FieldError id={errorId()} error={props.error} />
		</div>
	);
}
