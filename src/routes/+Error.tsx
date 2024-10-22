import { Heading, PageHeader, PageLayout } from '@components/Layout';

export const NotFound = () => {
	return (
		<PageLayout>
			<PageHeader>
				<Heading content="Sivua ei löytynyt" level="h1" />
			</PageHeader>
		</PageLayout>
	);
};

export const Unexpected = () => {
	return (
		<PageLayout>
			<PageHeader>
				<Heading content="Jokin meni pieleen" level="h1" />
			</PageHeader>
		</PageLayout>
	);
};
