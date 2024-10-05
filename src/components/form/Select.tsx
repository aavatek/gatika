import { createMemo, For, splitProps } from 'solid-js';
import styles from './@.module.css';
import { FieldError, FieldLabel } from './Field';

type SelectProps = {
	name?: string;
	value?: string | string[] | undefined;
	options: readonly string[];
	multiple?: boolean;
	size?: string | number;
	placeholder?: string;
	required?: boolean;
	class?: string;
	label: string;
	error?: string;
};

/**
 * Select field that allows users to select predefined values.
 */
export function Select(props: SelectProps) {
	const [, selectProps] = splitProps(props, [
		'class',
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
