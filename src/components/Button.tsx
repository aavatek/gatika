import { type ComponentProps, type JSX, splitProps } from 'solid-js';

type ButtonProps = {
	class?: string;
	type?: 'button' | 'submit' | 'reset';
	variant?: 'primary' | 'secondary';
	intent?: 'info' | 'warning' | 'danger' | 'success';
	content: string;
} & Omit<ComponentProps<'button'>, 'type'>;

export function Button(props: ButtonProps) {
	const variant = () => props.variant ?? 'primary';
	const type = () => props.type ?? 'button';

	const classString = `${props.class} ${variant()} ${props.intent}`;
	const [, buttonProps] = splitProps(props, [
		'class',
		'variant',
		'content',
		'type',
	]);

	return (
		<button {...buttonProps} type={type()} class={classString}>
			{props.content}
		</button>
	);
}
