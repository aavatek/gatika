import type { JSXElement } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import { Nav } from '@root/src/components/Nav';

// -------------------------------------------------------------------------------------

type LayoutProps = {
	children?: JSXElement;
};

export const Layout = (props: LayoutProps) => {
	return (
		<>
			<MetaTags />
			<Header />
			{props.children}
		</>
	);
};

// -------------------------------------------------------------------------------------

const MetaTags = () => {
	return (
		<>
			<Title>Gatika</Title>
			<Meta name="author" content="AavaTek" />
			<Meta name="description" content="Project management application" />
		</>
	);
};

// -------------------------------------------------------------------------------------

const Header = () => {
	const links = [
		{ href: '/', innerText: 'Yleiskatsaus' },
		{ href: '/projects', innerText: 'Projektit' },
		{ href: '/gantt', innerText: 'Gantt' },
	];

	return (
		<header>
			<Nav items={links} />
		</header>
	);
};

// -------------------------------------------------------------------------------------
