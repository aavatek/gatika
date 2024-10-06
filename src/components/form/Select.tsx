import type { ComponentProps } from 'solid-js';
import { createUniqueId, splitProps, For, Show } from 'solid-js';
import { FieldLabel } from './Field';
import styles from './@.module.css';

type SelectProps = {
	label: string;
	value?: string;
	error?: string;
	placeholder?: string;
	options: readonly string[];
} & ComponentProps<'select'>;

export function Select(props: SelectProps) {
	const id = createUniqueId();
	const [_, selectProps] = splitProps(props, [
		'options',
		'label',
		'error',
		'placeholder',
	]);

	return (
		<div>
			<FieldLabel for={id} label={props.label} />

			<select {...selectProps} id={id} class={styles.select}>
				<Show when={props.placeholder}>
					<option value="" label={props.placeholder} />
				</Show>

				<For each={props.options}>
					{(value) => (
						<option
							value={value}
							label={value}
							selected={value === props.value}
							class={styles.option}
						/>
					)}
				</For>
			</select>
		</div>
	);
}
