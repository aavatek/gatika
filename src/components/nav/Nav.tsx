import { A, type AnchorProps } from '@solidjs/router';
import { For, Match, Show, Switch, mergeProps } from 'solid-js';

type LinkProps = {
	label: string;
} & AnchorProps;

export const Link = (props: LinkProps) => {
	const linkProps = mergeProps({ end: true }, props);
	return <A {...linkProps}>{props.label}</A>;
};

type NavProps = {
	items?: LinkProps[];
};

export function Nav(props: NavProps) {
	const listItems = props.items ?? [];

	return (
		<Show when={listItems.length > 0}>
			<nav>
				<Switch>
					<Match when={listItems.length > 1}>
						<ul>
							<For each={listItems}>
								{(item) => (
									<li>
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
