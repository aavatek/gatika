import { Nav } from './Nav';
import styles from './@.module.css';

export default function Header() {
	const links = [
		{ label: 'Yleiskatsaus', href: '/' },
		{ label: 'Projektit', href: '/projects' },
	];

	return (
		<header class={styles.header}>
			<Nav items={links} />
		</header>
	);
}
