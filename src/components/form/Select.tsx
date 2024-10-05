import type { ComponentProps } from 'solid-js';
import { createMemo, For, splitProps } from 'solid-js';
import { FieldError, FieldLabel } from './Field';
import styles from './@.module.css';

type SelectProps = {
	value?: string | string[] | undefined;
	label: string;
	error?: string;
	options: readonly string[];
} & ComponentProps<'select'>;

/**
 * Select field that allows users to select predefined values.
 */
export function Select(props: SelectProps) {
	const [_, selectProps] = splitProps(props, [
		'value',
		'options',
		'label',
		'error',
	]);

	const getValues = createMemo(() =>
		Array.isArray(props.value)
			? props.value
			: typeof props.value === 'string'
				? [props.value]
				: [],
	);

	const getValueLabel = (value: string) => {
		return value === '' ? 'Valitse' : value;
	};

	return (
		<div>
			<FieldLabel name={props.name} label={props.label} />
			<select
				{...selectProps}
				class={styles.select}
				id={props.name}
				aria-invalid={!!props.error}
				aria-errormessage={`${props.name}-error`}
			>
				<For each={props.options}>
					{(value) => (
						<option value={value} selected={getValues().includes(value)}>
							{getValueLabel(value)}
						</option>
					)}
				</For>
			</select>

			<FieldError id={`${props.name}-error`} error={props.error} />
		</div>
	);
}
