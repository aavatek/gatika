import type { ComponentProps } from 'solid-js';
import { For, Show, createMemo, createUniqueId, splitProps } from 'solid-js';

// -------------------------------------------------------------------------------------

type ButtonProps = {
	label: string;
} & ComponentProps<'button'>;

export function Button(props: ButtonProps) {
	const [_, buttonProps] = splitProps(props, ['label']);
	return <button {...buttonProps}>{props.label}</button>;
}

// -------------------------------------------------------------------------------------

type FieldLabelProps = {
	id: string;
	label: string;
	required?: boolean;
};

export const FieldLabel = (props: FieldLabelProps) => {
	return <label for={props.id}>{props.label}</label>;
};

// -------------------------------------------------------------------------------------

type FieldErrorProps = {
	id?: string;
	error?: string;
};

export const FieldError = (props: FieldErrorProps) => {
	return (
		<output id={props.id} aria-hidden={props.error ? undefined : 'true'}>
			{props.error}
		</output>
	);
};

// -------------------------------------------------------------------------------------

export type InputFieldProps = {
	label: string;
	error?: string;
	value?: string | number;
} & Omit<ComponentProps<'input'>, 'value'>;

export function InputField(props: InputFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'error', 'value']);
	const id = createUniqueId();
	const errorID = createMemo(() => (props.error ? `${id}-error` : undefined));
	const value = createMemo(() => {
		return props.value == null ? String() : String(props.value);
	});

	return (
		<div>
			<FieldLabel id={id} label={props.label} />

			<input
				{...inputProps}
				id={id}
				value={value()}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={errorID()}
			/>

			<FieldError id={errorID()} error={props.error} />
		</div>
	);
}

// -------------------------------------------------------------------------------------

type SelectFieldProps = {
	label: string;
	value?: string;
	error?: string;
	options: readonly string[];
	placeholder?: string;
} & ComponentProps<'select'>;

export function SelectField(props: SelectFieldProps) {
	const id = createUniqueId();
	const [_, selectProps] = splitProps(props, [
		'options',
		'label',
		'error',
		'placeholder',
	]);

	return (
		<div>
			<FieldLabel id={id} label={props.label} />

			<select {...selectProps} id={id}>
				<Show when={props.placeholder}>
					<option value="" label={props.placeholder} />
				</Show>

				<For each={props.options}>
					{(value) => (
						<option
							value={value}
							label={value}
							selected={value === props.value}
						/>
					)}
				</For>
			</select>
		</div>
	);
}

// -------------------------------------------------------------------------------------
