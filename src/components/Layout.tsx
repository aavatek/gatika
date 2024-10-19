import { splitProps, type ComponentProps, type JSXElement } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import * as stylex from '@stylexjs/stylex';
import { Nav } from '@components/Nav';

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

type MainProps = {
	children?: JSXElement;
} & ComponentProps<'main'>;

export const Main = (props: MainProps) => {
	const [_, mainProps] = splitProps(props, ['children']);
	return (
		<main {...mainProps} {...stylex.props(styles.main)}>
			{props.children}
		</main>
	);
};

// -------------------------------------------------------------------------------------

const styles = stylex.create({
	main: {
		padding: '1.5rem 1rem',
	},
});
