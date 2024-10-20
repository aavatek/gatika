import { A, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import { Main } from '@components/Layout';
import * as sx from '@stylexjs/stylex';

export function TView() {
	const params = useParams();
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);

	return (
		<Show when={task()}>
			{(task) => (
				<Main>
					<header {...sx.props(style.header)}>
						<h1 {...sx.props(style.h1)}>{task().name}</h1>
						<A
							href={`/projects/${task().project}`}
							textContent="Takaisin"
							{...sx.props(style.link)}
						/>
					</header>
					<TaskEditForm task={task} />
				</Main>
			)}
		</Show>
	);
}

const style = sx.create({
	header: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'end',
		marginBottom: '1rem',
	},

	link: {
		color: 'inherit',
		fontSize: '1.25rem',
	},

	contentSection: {
		display: 'grid',
		gap: '2rem',
		gridTemplateColumns: {
			default: '1fr 1fr',
			'@media (max-width: 800px)': '1fr',
		},
	},

	h1: {
		fontSize: '2rem',
		lineHeight: '1.5rem',
	},
});
