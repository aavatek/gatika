import type { JSXElement } from 'solid-js';
import Header from '$/components/core/Header';

type LayoutProps = {
	children?: JSXElement;
};

export default function RootLayout(props: LayoutProps) {
	return (
		<>
			<Header />
			{props.children}
		</>
	);
}
