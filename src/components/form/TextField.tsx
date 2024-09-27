import { type ComponentProps, Show, splitProps } from 'solid-js';

export type TextFieldProps = {
	label: string;
	error?: string;
} & ComponentProps<'input'>;

export function TextField(props: TextFieldProps) {
	const errorId = () => `${props.name}-error`;
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);

	return (
		<div class="field | text-field">
			<label for={props.name} class="field-label">
				{props.label}
				{props.required && <span aria-hidden="true"> *</span>}
			</label>

			<input
				{...inputProps}
				id={props.name}
				value={props.value ?? String()}
				class="field-input"
				aria-required={props.required ? true : undefined}
				aria-invalid={props.error ? true : undefined}
				aria-errormessage={props.error ? errorId() : undefined}
			/>

			<Show when={props.error}>
				<output id={errorId()} class="field-error">
					{props.error}
				</output>
			</Show>
		</div>
	);
}
