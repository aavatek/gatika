import { Nav } from './Nav';

export default function Header() {
	const links = [
		{ label: 'Yleiskatsaus', href: '/' },
		{ label: 'Projektit', href: '/projects' },
	];

	return (
		<header>
			<Nav items={links} />
		</header>
	);
}
