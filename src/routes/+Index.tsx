import * as sx from '@stylexjs/stylex';
import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';
import { Main } from '@components/Layout';

export const Dashboard = () => {
	return (
		<Main extraStyles={styles.main}>
			<h1>Yleiskatsaus</h1>
			<section {...sx.props(styles.contentSection)}>
				<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
				<TaskList label="Seuraavat tehtävät" sort />
			</section>
		</Main>
	);
};

const styles = sx.create({
	main: {
		display: 'flex',
		flexDirection: 'column',
	},

	contentSection: {
		display: 'grid',
		gap: '2rem',
		gridTemplateColumns: {
			default: '1fr 1fr',
			'@media (max-width: 800px)': '1fr',
		},
	},
});
