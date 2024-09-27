import type { ComponentProps } from 'solid-js';
import { createMemo, splitProps } from 'solid-js';

type DateFieldProps = {
	label: string;
	value?: Date | number;
} & Omit<ComponentProps<'input'>, 'value'>;

export function DateField(props: DateFieldProps) {
	const [, inputProps] = splitProps(props, ['label', 'value']);

	const getValue = createMemo(() => {
		if (!props.value) return String();
		return !Number.isNaN(new Date(props.value).getTime())
			? new Date(props.value).toISOString().split('T')[0]
			: String();
	});

	return (
		<div class="field | date-field">
			<label for={props.name} class="field-label">
				{props.label} {props.required && <span> *</span>}
			</label>

			<input
				{...inputProps}
				type="date"
				id={props.name}
				value={getValue()}
				class="field-input"
			/>
		</div>
	);
}
