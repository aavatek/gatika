import type { ParentProps } from 'solid-js';
import { A } from '@solidjs/router';
import * as sx from '@stylexjs/stylex';
import { Heading } from '@components/Layout';

type ListItemProps = ParentProps<{
	href: string;
	name: string;
	extraStyles?: sx.StyleXStyles;
}>;

export const ListItem = (props: ListItemProps) => {
	return (
		<li {...sx.props(style.item)}>
			<A
				href={props.href}
				{...sx.props(style.itemWrapperLink, props.extraStyles)}
			>
				<span>{props.name}</span>
				{props.children}
			</A>
		</li>
	);
};

type ListProps = ParentProps<{
	label: string;
}>;

export const List = (props: ListProps) => {
	return (
		<section {...sx.props(style.listWrapper)}>
			<Heading content={props.label} level="h2" />
			<ol {...sx.props(style.list)}>{props.children}</ol>
		</section>
	);
};

const style = sx.create({
	listWrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
	},

	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: '.75rem',
	},

	itemWrapperLink: {
		textDecoration: 'none',
		color: 'black',
	},

	item: {
		boxShadow:
			'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
		padding: '1rem',
		background: {
			default: '#f0f0f0',
			':hover': '#ccc',
		},
		border: '1px solid rgba(0, 0, 0, 0.1)',
		boxSizing: 'border-box',
	},
});
