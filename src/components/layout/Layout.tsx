import Header from '$components/header/Header';
import type { JSXElement } from 'solid-js';

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
