import { createMemo, createSignal } from 'solid-js';
import { Button, SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';
import { Heading, PageHeader, PageLayout } from '@components/Layout';
import { Gantt } from '@components/Gantt';
import { redo, undo, canUndo, canRedo } from '@lib/history';
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
		<PageLayout>
			<PageHeader extraStyles={style.header}>
				<div {...sx.attrs(style.headingWrapper)}>
					<Heading content="Gantt" level="h1" />
					<SelectField
						variant="small"
						placeholder="Kaikki"
						options={projectSelectOptions}
						value={selected()}
						onChange={(e) => setSelected(e.target.value)}
					/>
				</div>

				<div {...sx.attrs(style.historyButtonWrapper)}>
					<Button
						label="undo"
						variant="primary"
						extraStyle={style.historyButton}
						onClick={() => undo()}
						disabled={!canUndo()}
					/>
					<Button
						label="redo"
						variant="primary"
						extraStyle={style.historyButton}
						onClick={() => redo()}
						disabled={!canRedo()}
					/>
				</div>
			</PageHeader>
			<Gantt tasks={ganttTasks()} />
		</PageLayout>
	);
};

const style = sx.create({
	headingWrapper: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'center',
	},

	historyButton: {
		placeSelf: 'end',
		padding: '.5rem',
		':disabled': {
			background: 'lightgray',
			':hover': {
				background: 'lightgray',
			},
		},
	},

	historyButtonWrapper: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'center',
	},

	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});
