import type { ComponentProps } from 'solid-js';
import { For, Show, createMemo, createUniqueId, splitProps } from 'solid-js';
import * as sx from '@stylexjs/stylex';

// -------------------------------------------------------------------------------------

type ButtonProps = {
	label: string;
	variant: 'primary' | 'warning' | 'link';
} & ComponentProps<'button'>;

export function Button(props: ButtonProps) {
	const [_, buttonProps] = splitProps(props, ['label', 'variant']);
	return (
		<button
			{...buttonProps}
			{...sx.props(style.button, style[`${props.variant}Button`])}
		>
			{props.label}
		</button>
	);
}

// -------------------------------------------------------------------------------------

type FieldLabelProps = {
	id: string;
	label?: string;
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
		<div {...sx.props(style.field)}>
			<FieldLabel id={id} label={props.label} />

			<input
				{...inputProps}
				id={id}
				value={value()}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={errorID()}
				{...sx.props(style.input)}
			/>

			<FieldError id={errorID()} error={props.error} />
		</div>
	);
}

// -------------------------------------------------------------------------------------

type Options = {
	value: string;
	label: string;
}[];

type SelectFieldProps = {
	label?: string;
	value?: string;
	error?: string;
	options: Options;
	placeholder?: string;
	variant?: 'small';
} & ComponentProps<'select'>;

export function SelectField(props: SelectFieldProps) {
	const id = createUniqueId();
	const [_, selectProps] = splitProps(props, [
		'options',
		'label',
		'error',
		'placeholder',
		'variant',
	]);

	return (
		<div {...sx.props(style.field)}>
			<FieldLabel id={id} label={props.label} />

			<select
				{...selectProps}
				id={id}
				{...sx.props(style.select(props.variant))}
			>
				<Show when={props.placeholder}>
					<option value="" label={props.placeholder} />
				</Show>

				<For each={props.options}>
					{(option) => (
						<option
							value={option.value}
							label={option.label}
							selected={option.value === props.value}
						/>
					)}
				</For>
			</select>
		</div>
	);
}

// -------------------------------------------------------------------------------------

const style = sx.create({
	field: {
		display: 'flex',
		flexDirection: 'column',
		gap: '.25rem',
	},

	input: {
		padding: '1rem',
		fontSize: '16px',
	},

	select: (variant: SelectFieldProps['variant']) => ({
		padding: variant ? '.25rem' : '1rem',
		fontSize: 'inherit',
	}),

	button: {
		padding: '1rem',
		outline: 'none',
		boxSizing: 'border-box',
		border: '2px solid black',
		fontSize: 'inherit',
	},

	primaryButton: {
		background: {
			default: '#f0f0f0',
			':hover': '#ccc',
			':focus': '#ccc',
		},
	},

	warningButton: {
		border: '2px solid #b71c1c',
		color: '#b71c1c',
		fontWeight: 600,
		background: {
			default: '#ffebee',
			':hover': '#ffcde2',
			':focus': '#ffcde2',
		},
	},

	linkButton: {
		padding: 0,
		border: 'none',
		background: 'none',
		cursor: 'pointer',
	},
});
