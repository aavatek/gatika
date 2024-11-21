import { createMemo, createSignal } from 'solid-js';
import { Button, SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';
import { Heading, PageHeader, PageLayout } from '@components/Layout';
import { Gantt } from '@components/Gantt';
import { redo, undo } from '@lib/history';

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
				<Heading content="Gantt" level="h1" />
				<SelectField
					variant="small"
					placeholder="Kaikki"
					options={projectSelectOptions}
					value={selected()}
					onChange={(e) => setSelected(e.target.value)}
				/>
				<Button label="undo" variant="primary" onClick={() => undo()} />
				<Button label="redo" variant="primary" onClick={() => redo()} />
			</PageHeader>
			<Gantt tasks={ganttTasks()} />
		</PageLayout>
	);
};
