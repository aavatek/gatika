import { PageLayout } from '@components/Layout';

export const NotFound = () => {
	return (
		<PageLayout>
			<h1>Sivua ei löytynyt</h1>
		</PageLayout>
	);
};

export const Unexpected = () => {
	return (
		<PageLayout>
			<h1>Jokin meni vikaan</h1>
		</PageLayout>
	);
};
