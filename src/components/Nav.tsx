import { A, type AnchorProps } from '@solidjs/router';
import { For, Switch, Match, Show } from 'solid-js';

type NavProps = {
	items: AnchorProps[];
};

export function Nav(props: NavProps) {
	const navListItems = props.items ?? [];

	return (
		<Show when={navListItems.length > 0}>
			<nav>
				<Switch>
					<Match when={navListItems.length > 1}>
						<ul>
							<For each={navListItems}>
								{(item) => (
									<li>
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
