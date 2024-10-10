import { splitProps } from 'solid-js';
import type { ComponentProps } from 'solid-js';

type ButtonProps = {
	label: string;
} & ComponentProps<'button'>;

export function Button(props: ButtonProps) {
	const [_, buttonProps] = splitProps(props, ['label']);

	return <button {...buttonProps}>{props.label}</button>;
}
