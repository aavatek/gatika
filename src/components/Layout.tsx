import { splitProps, type ComponentProps, type JSXElement } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import * as sx from '@stylexjs/stylex';
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

type PageLayoutProps = {
	children?: JSXElement;
} & ComponentProps<'main'>;

export const PageLayout = (props: PageLayoutProps) => {
	const [_, mainProps] = splitProps(props, ['children']);
	return (
		<main {...mainProps} {...sx.props(styles.pageLayout)}>
			{props.children}
		</main>
	);
};

// -------------------------------------------------------------------------------------

type PageHeaderProps = {
	children?: JSXElement;
} & ComponentProps<'header'>;

export const PageHeader = (props: PageHeaderProps) => {
	const [_, headerProps] = splitProps(props, ['children']);
	return (
		<header {...headerProps} {...sx.props(styles.pageHeader)}>
			{props.children}
		</header>
	);
};

type PageContentSectionProps = {
	children?: JSXElement;
} & ComponentProps<'section'>;

export const PageContentSection = (props: PageContentSectionProps) => {
	const [_, sectionProps] = splitProps(props, ['children']);
	return (
		<section {...sectionProps} {...sx.props(styles.pageContentSection)}>
			{props.children}
		</section>
	);
};

type HeadingOneProps = {
	content: string;
} & ComponentProps<'h1'>;

export const H1 = (props: HeadingOneProps) => {
	const [_, h1Props] = splitProps(props, ['content']);
	return (
		<h1 {...h1Props} {...sx.props(styles.h1)}>
			{props.content}
		</h1>
	);
};

const styles = sx.create({
	pageLayout: {
		padding: '1.5rem 1rem',
		display: 'grid',
		gridTemplateRows: 'auto 1fr',
	},

	pageHeader: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'center',
		height: '4rem',
	},

	pageContentSection: {
		display: 'grid',
		gap: '2rem',
		gridTemplateColumns: {
			default: '1fr 1fr',
			'@media (max-width: 800px)': '1fr',
		},
	},

	h1: {
		fontSize: '2rem',
		lineHeight: '1.5rem',
	},
});
