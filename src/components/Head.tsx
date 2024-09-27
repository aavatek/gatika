import favicon from '$assets/favicon.ico';
import { Link, Meta, Title } from '@solidjs/meta';

export default function Head() {
	return (
		<>
			<Title>Gatika</Title>
			<Meta charset="utf-8" />
			<Meta name="author" content="AavaTek" />
			<Meta name="viewport" content="width=device-width, initial-scale=1" />
			<Link rel="icon" href={favicon} />
		</>
	);
}
