import { A, type AnchorProps } from '@solidjs/router';
import { For, Switch, Match, Show } from 'solid-js';
import * as stylex from '@stylexjs/stylex';

type NavProps = {
	items: AnchorProps[];
};

export function Nav(props: NavProps) {
	const navListItems = props.items ?? [];

	return (
		<Show when={navListItems.length > 0}>
			<nav {...stylex.props(styles.nav)}>
				<Switch>
					<Match when={navListItems.length > 1}>
						<ul {...stylex.props(styles.navList)}>
							<For each={navListItems}>
								{(item) => (
									<li {...stylex.props(styles.navListItem)}>
										<A {...item} />
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

const styles = stylex.create({
	nav: {
		borderBottom: '2px solid black',
	},

	navList: {
		display: 'flex',
		gap: '1rem',
		padding: '1.5rem 1rem',
	},

	navListItem: {},
});
