import { type ComponentProps, createMemo, splitProps } from 'solid-js';

type NumberInputProps = {
	name: string;
	label: string;
	value: number | undefined;
	required?: boolean;
	class?: string;
	min?: number;
	max?: number;
	step?: number;
} & ComponentProps<'input'>;

export function NumberInput(props: NumberInputProps) {
	const [, inputProps] = splitProps(props, ['class', 'label', 'value']);

	const getValue = createMemo(() => {
		const value = props.value;
		return value !== undefined && !Number.isNaN(value) ? value : '';
	});

	return (
		<div class={props.class}>
			<label for={props.name}>
				{props.label} {props.required && <span>*</span>}
			</label>
			<input {...inputProps} id={props.name} type="number" value={getValue()} />
		</div>
	);
}
