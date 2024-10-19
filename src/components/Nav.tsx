import { A, type AnchorProps } from '@solidjs/router';
import { For, Switch, Match, Show } from 'solid-js';
import * as sx from '@stylexjs/stylex';

type NavProps = {
	items: AnchorProps[];
};

export function Nav(props: NavProps) {
	const navListItems = props.items ?? [];

	return (
		<Show when={navListItems.length > 0}>
			<nav {...sx.props(styles.nav)}>
				<Switch>
					<Match when={navListItems.length > 1}>
						<ul {...sx.props(styles.navList)}>
							<For each={navListItems}>
								{(item) => (
									<li {...sx.props(styles.navListItem)}>
										<A {...item} {...sx.props(styles.navListItemLink)} />
									</li>
								)}
							</For>
						</ul>
					</Match>

					<Match when={navListItems.length === 1}>
						<A {...navListItems[0]} />
					</Match>
				</Switch>
			</nav>
		</Show>
	);
}

const styles = sx.create({
	nav: {
		borderBottom: '2px solid black',
	},

	navList: {
		display: 'flex',
		gap: '1rem',
		padding: '1.5rem 1rem',
	},

	navListItem: {},

	navListItemLink: {
		textDecoration: 'none',
		color: 'black',
	},
});
