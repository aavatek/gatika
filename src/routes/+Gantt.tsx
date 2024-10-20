import { createMemo, createSignal } from 'solid-js';
import { SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';
import { Main } from '@components/Layout';
import { Gantt } from '@components/Gantt';
import * as sx from '@stylexjs/stylex';

export const Page = () => {
	const [selected, setSelected] = createSignal('');

	const projectSelectOptions = projects.list().map((p) => ({
		label: p.name,
		value: p.id as Project['id'],
	}));

	const ganttTasks = createMemo(() => {
		return [
			...(selected() === ''
				? tasks.list()
				: tasks.listByProject(selected() as Project['id'])),
		];
	});

	return (
		<Main>
			<header {...sx.props(style.header)}>
				<h1 {...sx.props(style.h1)}>Gantt</h1>
				<SelectField
					placeholder="Kaikki"
					options={projectSelectOptions}
					value={selected()}
					onChange={(e) => setSelected(e.target.value)}
					extraStyle={style.select}
				/>
			</header>
			<Gantt tasks={ganttTasks()} />
		</Main>
	);
};

const style = sx.create({
	header: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: '1rem',
	},

	h1: {
		fontSize: '2rem',
		lineHeight: '1.5rem',
	},

	select: {
		padding: '.15rem',
		fontSize: '1.15rem',
		border: '2px solid black',
	},
});
