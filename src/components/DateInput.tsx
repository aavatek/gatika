import { type JSX, createMemo, splitProps } from "solid-js";

type DateInputProps = {
	name: string;
	label: string;
	value: Date | number | undefined;
	required?: boolean;
	class?: string;
	min?: string;
	max?: string;
	ref?: (element: HTMLInputElement) => void;
	onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
	onChange: JSX.EventHandler<HTMLInputElement, Event>;
	onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
};

export function DateInput(props: DateInputProps) {
	const [, inputProps] = splitProps(props, ["class", "label", "value"]);

	const getDate = createMemo(() => {
		const value = props.value;
		return value &&
			!Number.isNaN(value instanceof Date ? value.getTime() : value)
			? new Date(value).toISOString().slice(0, 10)
			: "";
	});

	return (
		<div class={props.class}>
			<label for={props.name}>
				{props.label} {props.required && <span>*</span>}
			</label>
			<input {...inputProps} type="date" id={props.name} value={getDate()} />
		</div>
	);
}
