import * as sx from '@stylexjs/stylex';
import { TaskList } from '@features/Task';
import { ProjectList } from '@features/Project';
import { Main } from '@components/Layout';

export const Dashboard = () => {
	return (
		<Main extraStyles={style.main}>
			<header {...sx.props(style.header)}>
				<h1 {...sx.props(style.h1)}>Yleiskatsaus</h1>
			</header>
			<section {...sx.props(style.contentSection)}>
				<ProjectList label="Viimeksi katsottu" filter="lastAccessed" />
				<TaskList label="Seuraavat tehtävät" sort />
			</section>
		</Main>
	);
};

const style = sx.create({
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

	header: {
		marginBottom: '1rem',
	},

	h1: {
		fontSize: '2rem',
		lineHeight: '1.5rem',
	},
});
