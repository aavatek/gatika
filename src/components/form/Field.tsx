import { createMemo } from 'solid-js';

type FieldLabelProps = {
	for: string;
	label: string;
	required?: boolean;
};

export const FieldLabel = (props: FieldLabelProps) => {
	return (
		<label for={props.for}>
			{props.label}
			{props.required && <span aria-hidden="true"> *</span>}
		</label>
	);
};

type FieldErrorProps = {
	id?: string;
	error?: string;
};

export const FieldError = (props: FieldErrorProps) => {
	const hidden = createMemo(() => (props.error ? undefined : 'true'));

	return (
		<output id={props.id} aria-hidden={hidden()}>
			{props.error}
		</output>
	);
};
