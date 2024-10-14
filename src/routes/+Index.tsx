import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';

export const Dashboard = () => {
	return (
		<main>
			<h1>Yleiskatsaus</h1>
			<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
			<TaskList label="Seuraavat tehtävät" sort />
		</main>
	);
};
