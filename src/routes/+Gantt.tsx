import { createMemo, createSignal, For } from 'solid-js';
import { SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';

export const Gantt = () => {
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
		<main>
			<h1>Gantt</h1>
			<SelectField
				placeholder="Kaikki"
				options={projectSelectOptions}
				value={selected()}
				onChange={(e) => setSelected(e.target.value)}
			/>

			<For each={ganttTasks()}>{(task) => <p>{task.name}</p>}</For>
		</main>
	);
};
