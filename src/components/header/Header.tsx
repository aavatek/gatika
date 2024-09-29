import { Nav } from '$components/nav/Nav';

export default function Header() {
	const links = [
		{ label: 'Overview', href: '/' },
		{ label: 'Tasks', href: '/tasks' },
	];

	return (
		<header>
			<Nav items={links} />
		</header>
	);
}
