import styles from './@.module.css';

type FieldLabelProps = {
	name?: string;
	label?: string;
	required?: boolean;
};

export function FieldLabel(props: FieldLabelProps) {
	return (
		<label for={props.name} class={styles.label}>
			{props.label}
			{props.required && <span aria-hidden="true"> *</span>}
		</label>
	);
}
