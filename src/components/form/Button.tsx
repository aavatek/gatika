import { type ComponentProps, type JSX, splitProps } from 'solid-js';

type ButtonProps = {
	type?: 'button' | 'submit' | 'reset';
	variant?: 'primary' | 'secondary';
	intent?: 'info' | 'warning' | 'danger' | 'success';
	content: string;
} & Omit<ComponentProps<'button'>, 'type'>;

export function Button(props: ButtonProps) {
	const type = () => props.type ?? 'button';
	const classList = () => `${props.variant ?? 'primary'} ${props.intent ?? ''}`;
	const [, buttonProps] = splitProps(props, ['variant', 'intent', 'content']);

	return (
		<button {...buttonProps} type={type()} class={classList()}>
			{props.content}
		</button>
	);
}
