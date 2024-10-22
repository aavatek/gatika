import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';
import {
	Heading,
	PageContentSection,
	PageHeader,
	PageLayout,
} from '@components/Layout';

export const Dashboard = () => {
	return (
		<PageLayout>
			<PageHeader>
				<Heading content="Yleiskatsaus" level="h1" />
			</PageHeader>
			<PageContentSection>
				<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
				<TaskList label="Seuraavat tehtävät" sort />
			</PageContentSection>
		</PageLayout>
	);
};
