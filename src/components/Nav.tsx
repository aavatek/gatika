import { A, type AnchorProps } from '@solidjs/router';
import { For, Match, Show, Switch, mergeProps } from 'solid-js';
import styles from './Nav.module.css';

type LinkProps = { label: string } & AnchorProps;
export const Link = (props: LinkProps) => {
	const linkProps = mergeProps({ end: true }, props);
	return (
		<A {...linkProps} class={styles.link}>
			{props.label}
		</A>
	);
};

type NavProps = { items?: LinkProps[] };
export function Nav(props: NavProps) {
	const listItems = props.items ?? [];

	return (
		<Show when={listItems.length > 0}>
			<nav class={styles.nav}>
				<Switch>
					<Match when={listItems.length > 1}>
						<ul class={styles.navList}>
							<For each={listItems}>
								{(item) => (
									<li class={styles.navListItem}>
										<Link {...item} />
									</li>
								)}
							</For>
						</ul>
					</Match>

					<Match when={listItems.length === 1}>
						<Link {...listItems[0]} />
					</Match>
				</Switch>
			</nav>
		</Show>
	);
}
