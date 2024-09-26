import { A, type AnchorProps } from '@solidjs/router';
import { For, splitProps } from 'solid-js';
import './NavBar.css';

type LinkProps = {
	text: string;
} & AnchorProps;

const Link = (props: LinkProps) => {
	const [, inputProps] = splitProps(props, ['text']);
	return <A {...inputProps}>{props.text}</A>;
};

type LinkItem = Pick<LinkProps, 'text' | 'href'>;
const links: LinkItem[] = [{ href: '/', text: 'Dashboard' }];

export default function NavBar() {
	return (
		<nav class="nav">
			<ul class="nav-list">
				<For each={links}>
					{(link) => (
						<li class="nav-item">
							<Link
								end={true}
								href={link.href}
								text={link.text}
								class="nav-item-link"
								activeClass="nav-item-link-active"
							/>
						</li>
					)}
				</For>
			</ul>
		</nav>
	);
}
