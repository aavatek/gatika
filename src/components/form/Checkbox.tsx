import { splitProps } from 'solid-js';

type CheckboxProps = {
	name?: string;
	content?: string;
	value?: string;
	checked?: boolean;
	required?: boolean;
	class?: string;
	label: string;
	error?: string;
	padding?: 'none';
};

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 */
export function Checkbox(props: CheckboxProps) {
	const [, inputProps] = splitProps(props, [
		'class',
		'value',
		'label',
		'error',
	]);

	return (
		<label>
			{props.label}
			<input
				type="checkbox"
				{...inputProps}
				id={props.name}
				value={props.value || ''}
				checked={props.checked}
				aria-invalid={!!props.error}
				aria-errormessage={`${props.name}-error`}
			/>
		</label>
	);
}
