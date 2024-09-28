import { Show } from 'solid-js';

type FieldErrorProps = {
	id?: string;
	error?: string;
};

export function FieldError(props: FieldErrorProps) {
	return (
		<Show when={props.error} fallback={<output aria-hidden="true" />}>
			<output id={props.id}>{props.error}</output>
		</Show>
	);
}
