import { A, type AnchorProps } from '@solidjs/router';
import { For, splitProps } from 'solid-js';

type LinkProps = {
	label: string;
} & AnchorProps;

export const Link = (props: LinkProps) => {
	return (
		<A class="link" activeClass="link-active" {...props}>
			{props.label}
		</A>
	);
};

export default function Header() {
	return (
		<header class="header">
			<nav class="nav">
				<ul class="nav-list">
					<li class="nav-list-item">
						<Link label="Dashboard" href="/" end={true} />
					</li>
				</ul>
			</nav>
		</header>
	);
}
