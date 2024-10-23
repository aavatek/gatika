import { splitProps, type ComponentProps, type JSXElement } from 'solid-js';
import { Meta, Title } from '@solidjs/meta';
import * as sx from '@stylexjs/stylex';
import { Nav } from '@components/Nav';
import { Dynamic } from 'solid-js/web';
import { Notification } from '@features/Notification';

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
			<Notification />
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
		<main {...mainProps} {...sx.props(style.pageLayout)}>
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
		<header {...headerProps} {...sx.props(style.pageHeader)}>
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
		<section {...sectionProps} {...sx.props(style.pageContentSection)}>
			{props.children}
		</section>
	);
};

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingProps = {
	content: string;
	level: HeadingLevel;
} & ComponentProps<HeadingLevel>;

export const Heading = (props: HeadingProps) => {
	const [_, headingProps] = splitProps(props, ['content', 'level']);
	return (
		<Dynamic
			component={props.level}
			{...headingProps}
			{...sx.props(style[props.level])}
		>
			{props.content}
		</Dynamic>
	);
};

const style = sx.create({
	pageLayout: {
		padding: '1.5rem 1rem',
		display: 'grid',
		gridTemplateRows: 'auto 1fr',
		rowGap: '1rem',
	},

	pageHeader: {
		display: 'flex',
		columnGap: '1rem',
		alignItems: 'center',
	},

	pageContentSection: {
		display: 'grid',
		gap: '2rem',
		gridTemplateColumns: {
			default: '1fr 1fr',
			'@media (max-width: 800px)': '1fr',
		},
	},

	h1: { fontSize: '2rem' },
	h2: { fontSize: '1.5rem' },
	h3: { fontSize: '1.25rem' },
	h4: { fontSize: '1rem' },
	h5: { fontSize: '1rem' },
	h6: { fontSize: '1rem' },
});
