import { Main } from '@components/Layout';

export const NotFound = () => {
	return (
		<Main>
			<h1>Sivua ei löytynyt</h1>
		</Main>
	);
};

export const Unexpected = () => {
	return (
		<Main>
			<h1>Jokin meni vikaan</h1>
		</Main>
	);
};
