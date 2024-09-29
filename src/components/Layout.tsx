import type { JSXElement } from 'solid-js';
import Header from './Header';

type LayoutProps = {
	children?: JSXElement;
};

export default function Layout(props: LayoutProps) {
	return (
		<>
			<Header />
			{props.children}
		</>
	);
}
