import type { ComponentProps } from 'solid-js';
import { createMemo, createUniqueId, splitProps, For } from 'solid-js';
import { FieldError, FieldLabel } from './Field';
import styles from './@.module.css';

type SelectProps = {
	label: string;
	error?: string;
	options: readonly string[];
} & ComponentProps<'select'>;

export function Select(props: SelectProps) {
	const [_, selectProps] = splitProps(props, ['options', 'label', 'error']);

	const id = createUniqueId();
	const errorId = createMemo(() => (props.error ? `${id}-error` : undefined));
	const values = createMemo(() => (props.value ? [props.value] : []));

	return (
		<div>
			<FieldLabel for={id} label={props.label} />

			<select
				{...selectProps}
				id={id}
				aria-invalid={props.error ? 'true' : undefined}
				aria-errormessage={errorId()}
				class={styles.select}
			>
				<For each={props.options}>
					{(value) => (
						<option value={value} selected={values().includes(value)}>
							{value === '' && 'Valitse'}
							{value !== '' && value}
						</option>
					)}
				</For>
			</select>

			<FieldError id={errorId()} error={props.error} />
		</div>
	);
}
