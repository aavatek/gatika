import { Link, Meta, Title } from '@solidjs/meta';

export default function Head() {
	return (
		<>
			<Title>Gatika</Title>
			<Meta name="author" content="AavaTek" />
			<Meta name="description" content="PoC Gantt project management app" />
			<Link rel="icon" href="/favicon.svg" type="image/svg+xml" />
		</>
	);
}
