import { type ComponentProps, createMemo, splitProps } from 'solid-js';
import styles from './@.module.css';

type ButtonProps = {
	type?: 'button' | 'submit' | 'reset';
	content: string;
} & Omit<ComponentProps<'button'>, 'type'>;

export function Button(props: ButtonProps) {
	const type = createMemo(() => props.type ?? 'button');
	const [, buttonProps] = splitProps(props, ['content']);

	return (
		<button {...buttonProps} type={type()} class={styles.button}>
			{props.content}
		</button>
	);
}
