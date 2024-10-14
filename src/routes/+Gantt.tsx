import { createMemo, createSignal, For } from 'solid-js';
import { SelectField } from '@components/Form';
import { projects, type Project } from '@features/Project';
import { tasks } from '@features/Task';

export const Gantt = () => {
	const [selected, setSelected] = createSignal('');
	const [distance, setDistance] = createSignal(30);
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
	const ganttTasksWithDate = createMemo(() => {
		return ganttTasks()
			.filter((task) => task.start && task.duration)
			.map((task) => ({ ...task, start: new Date(task.start as Date) }));
	});
	const earliestStartDate = createMemo(() => {
		const dates = ganttTasksWithDate().map((task) => task.start);
		return new Date(Math.min(...dates.map((d) => d.getTime())));
	});
	const [chartStartDate, setChartStartDate] = createSignal(earliestStartDate());

	const handleResize = (e: MouseEvent, gridSize: number) => {
		const target = e.target as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const snappedWidth = Math.round(x / gridSize) * gridSize;
		target.style.width = `${snappedWidth}px`;
	};

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
			<div class="gantt">
				<For each={ganttTasksWithDate()}>
					{(task) => {
						const length = createMemo(() => {
							return task.duration ? (task.duration / distance()) * 100 : 15;
						});
						const startOffset = createMemo(() => {
							const diffTime =
								task.start.getTime() - chartStartDate().getTime();
							const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
							return diffDays + 1;
						});

						return (
							<div
								class="gantt-row"
								style={{
									width: '100%',
									border: '1px solid black',
									display: 'grid',
									'grid-template-columns': `repeat(${distance()}, 1fr)`,
								}}
							>
								<div
									class="gantt-row-item"
									style={{
										border: '1px solid black',
										'grid-column': `${startOffset()} / span ${Math.ceil(length() / (100 / distance()))}`,
										'min-width': '0',
										overflow: 'hidden',
										resize: 'horizontal',
										position: 'relative',
									}}
									onMouseUp={(e) => handleResize(e, 100 / distance())}
								>
									{task.name}
									<div
										style={{
											position: 'absolute',
											right: '0',
											top: '0',
											bottom: '0',
											width: '5px',
											cursor: 'col-resize',
										}}
									/>
								</div>
							</div>
						);
					}}
				</For>
			</div>
		</main>
	);
};
