import { Nav } from './Nav';
import styles from './@.module.css';

export default function Header() {
	const links = [
		{ label: 'Yleiskatsaus', href: '/' },
		{ label: 'Tehtävät', href: '/tasks' },
		{ label: 'Gantt', href: '/gantt' },
	];

	return (
		<header class={styles.header}>
			<Nav items={links} />
		</header>
	);
}
