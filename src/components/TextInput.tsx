import { type ComponentProps, Show, splitProps } from 'solid-js';

export type TextInputProps = {
	label: string;
	error?: string;
	class?: string;
} & ComponentProps<'input'>;

export function TextInput(props: TextInputProps) {
	const errorId = () => `${props.name}-error`;
	const [, inputProps] = splitProps(props, [
		'label',
		'error',
		'class',
		'value',
	]);

	return (
		<div class={props.class}>
			<label for={props.name}>
				{props.label}
				{props.required && <span aria-hidden="true"> *</span>}
			</label>

			<input
				{...inputProps}
				value={props.value ?? ''}
				id={props.name}
				aria-required={props.required ? true : undefined}
				aria-invalid={props.error ? true : undefined}
				aria-errormessage={props.error ? errorId() : undefined}
			/>

			<Show when={props.error}>
				<output id={errorId()}>{props.error}</output>
			</Show>
		</div>
	);
}
