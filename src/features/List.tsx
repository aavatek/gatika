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
		<A href={props.href} {...sx.props(style.itemWrapperLink)}>
			<li {...sx.props(style.item, props.extraStyles)}>
				<span>{props.name}</span>
				{props.children}
			</li>
		</A>
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
		gap: '.5rem',
	},

	itemWrapperLink: {
		textDecoration: 'none',
		color: 'black',
	},

	item: {
		border: '2px solid black',
		padding: '1rem',
		background: {
			default: '#f0f0f0',
			':hover': '#ccc',
		},
	},
});
