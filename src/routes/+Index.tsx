import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';
import { Main } from '@components/Layout';

export const Dashboard = () => {
	return (
		<Main>
			<h1>Yleiskatsaus</h1>
			<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
			<TaskList label="Seuraavat tehtävät" sort />
		</Main>
	);
};
