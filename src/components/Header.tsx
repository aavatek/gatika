import { Nav } from './Nav';
import styles from './Header.module.css';

export default function Header() {
	const links = [
		{ label: 'Yleiskatsaus', href: '/' },
		{ label: 'Tehtävät', href: '/tasks' },
	];

	return (
		<header class={styles.header}>
			<Nav items={links} />
		</header>
	);
}
