import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';
import {
	H1,
	PageContentSection,
	PageHeader,
	PageLayout,
} from '@components/Layout';

export const Dashboard = () => {
	return (
		<PageLayout>
			<PageHeader>
				<H1 content="Yleiskatsaus" />
			</PageHeader>
			<PageContentSection>
				<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
				<TaskList label="Seuraavat tehtävät" sort />
			</PageContentSection>
		</PageLayout>
	);
};
