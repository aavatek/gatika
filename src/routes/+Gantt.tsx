import { createMemo, createSignal } from 'solid-js';
import { SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';
import { H1, PageHeader, PageLayout } from '@components/Layout';
import { Gantt } from '@components/Gantt';

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
		<PageLayout>
			<PageHeader>
				<H1 content="Gantt" />
				<SelectField
					variant="small"
					placeholder="Kaikki"
					options={projectSelectOptions}
					value={selected()}
					onChange={(e) => setSelected(e.target.value)}
				/>
			</PageHeader>
			<Gantt tasks={ganttTasks()} />
		</PageLayout>
	);
};
