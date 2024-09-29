import styles from '$src/app.css?url';
import { Link, Meta, Title } from '@solidjs/meta';
import favicon from '/favicon.svg?url';

export default function Head() {
	return (
		<>
			<Title>Gatika</Title>
			<Meta name="author" content="AavaTek" />
			<Meta name="description" content="PoC Gantt project management app" />
			<Link rel="icon" href={favicon} type="image/svg+xml" />
			<Link rel="stylesheet" href={styles} />
		</>
	);
}
