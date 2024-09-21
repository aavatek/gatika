import { type JSX, Show, onMount, splitProps } from 'solid-js';

type TextFieldProps = {
	name: string;
	type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date';
	label: string;
	placeholder?: string;
	value: string | undefined;
	error?: string;
	required?: boolean;
	class?: string;
	ref: (element: HTMLInputElement) => void;
	onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
	onChange: JSX.EventHandler<HTMLInputElement, Event>;
	onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
};

export function TextField(props: TextFieldProps) {
	const [, inputProps] = splitProps(props, [
		'class',
		'error',
		'label',
		'value',
	]);

	return (
		<div class={props.class}>
			<label for={props.name}>
				{props.label} {props.required && <span>*</span>}
			</label>

			<input
				{...inputProps}
				id={props.name}
				value={props.value || ''}
				aria-invalid={!!props.error}
				aria-errormessage={props.error ? `${props.name}-error` : undefined}
			/>

			<Show when={props.error}>
				<output id={`${props.name}-error`}>{props.error}</output>
			</Show>
		</div>
	);
}
