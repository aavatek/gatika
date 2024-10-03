import { createMemo, For, splitProps } from 'solid-js';
import styles from './@.module.css';

type SelectProps = {
	name?: string;
	value?: string | string[] | undefined;
	options: { label: string; value: string }[];
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

	// Create values list
	const getValues = createMemo(() =>
		Array.isArray(props.value)
			? props.value
			: typeof props.value === 'string'
				? [props.value]
				: [],
	);

	return (
		<div>
			<select
				{...selectProps}
				class={styles.select}
				id={props.name}
				aria-invalid={!!props.error}
				aria-errormessage={`${props.name}-error`}
			>
				<For each={props.options}>
					{({ label, value }) => (
						<option value={value} selected={getValues().includes(value)}>
							{label}
						</option>
					)}
				</For>
			</select>
		</div>
	);
}
