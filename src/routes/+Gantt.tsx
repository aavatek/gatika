import { createMemo, createSignal } from 'solid-js';
import { SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';
import { getTime } from '@solid-primitives/date';
import { Gantt, type GanttTask } from '@components/Gantt';

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
		].map((task) => ({
			id: task.id,
			name: task.name,
			start: task.start ? getTime(task.start) : null,
			end: task.end ? getTime(task.end) : null,
		})) as GanttTask[];
	});

	return (
		<main>
			<h1>Gantt</h1>
			<SelectField
				label="Valitse tehtävät"
				placeholder="Kaikki"
				options={projectSelectOptions}
				value={selected()}
				onChange={(e) => setSelected(e.target.value)}
			/>

			<Gantt tasks={ganttTasks()} />
		</main>
	);
};
