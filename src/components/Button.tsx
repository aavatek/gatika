import { type ComponentProps, type JSX, splitProps } from 'solid-js';

type ButtonProps = {
	class?: string;
	variant?: 'primary' | 'secondary';
	intent?: 'info' | 'warning' | 'danger' | 'success';
	content: string;
} & ComponentProps<'button'>;

export function Button(props: ButtonProps) {
	const variant = props.variant ?? 'primary';

	const classString = `${props.class} ${props.variant} ${props.intent}`;
	const [, buttonProps] = splitProps(props, ['class', 'variant', 'content']);

	return (
		<button {...buttonProps} class={classString}>
			{props.content}
		</button>
	);
}
