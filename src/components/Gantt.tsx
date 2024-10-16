import { For, onMount, createMemo, createSignal } from 'solid-js';
import { DAY, MONTH, WEEK } from '@solid-primitives/date';
import { tasks, type Task } from '@features/Task';
import { formatTime } from '../lib/dates';

export const Gantt = (props: { tasks: Task[] }) => {
	const [cols] = createSignal(210);
	const [zoomModifier, setZoomModifier] = createSignal(2);

	const gridAnchorDate = createMemo(() => {
		const date = new Date(Date.now() - WEEK * 2);
		return Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
		);
	});

	const gridStartDate = createMemo(() => {
		const date = new Date(Date.now() - 3 * MONTH);
		return Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
		);
	});

	const gridEndDate = createMemo(() => gridStartDate() + cols() * DAY);

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 1;
		const MAX_ZOOM = 12;
		const SENSITIVITY = 0.001;

		if (e.ctrlKey) {
			e.preventDefault();
			const ganttWrapper = document.getElementById('ganttWrapper');
			if (ganttWrapper) {
				const rect = ganttWrapper.getBoundingClientRect();
				const mouseX = e.clientX - rect.left + ganttWrapper.scrollLeft;

				const zoomFactor = Math.exp(-e.deltaY * SENSITIVITY);
				const newZoomLevel = Math.max(
					MIN_ZOOM,
					Math.min(MAX_ZOOM, zoomModifier() * zoomFactor),
				);

				const newWidth = cols() * newZoomLevel;
				const ratio = mouseX / (cols() * zoomModifier());
				const newScrollLeft = ratio * newWidth - (e.clientX - rect.left);

				setZoomModifier(newZoomLevel);
				ganttWrapper.scrollLeft = newScrollLeft;
			}
		}
	};

	onMount(() => {
		const ganttWrapper = document.getElementById('ganttWrapper');
		if (ganttWrapper) {
			const gantt = document.getElementById('gantt');
			if (gantt) {
				const cellWidth = gantt.getBoundingClientRect().width / cols();
				const daysDiff = (gridAnchorDate() - gridStartDate() - DAY) / DAY;
				const pos = Math.ceil(daysDiff * cellWidth);
				ganttWrapper.scrollLeft = pos;
			}
		}
	});

	const tasksWithinRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate())
			.filter((task) => !task.end || task.end < gridEndDate()),
	);

	return (
		<div
			onWheel={handleZoom}
			style={{ 'overflow-x': 'auto' }}
			id="ganttWrapper"
		>
			<For each={tasksWithinRange()}>
				{(task) => {
					const current = createMemo(() => ({
						...task,
						start: task.start || gridAnchorDate() + DAY,
						end: task.end || gridAnchorDate() + DAY + WEEK,
						floating: !task.start,
					}));

					const [valid, setValid] = createSignal(true);

					const minStart = createMemo(() => {
						const dependencyEnds = task.dependencies
							.map((dep) => tasks.read(dep as Task['id'])())
							.filter((dep) => dep?.end)
							.map((dep) => dep?.end as number);

						return dependencyEnds.length > 0
							? Math.max(...dependencyEnds)
							: undefined;
					});

					const colStart = createMemo(() => {
						const time = current().start - gridStartDate();
						return Math.floor(time / DAY);
					});

					const colSpan = createMemo(() => {
						const range = current().end - current().start;
						return Math.floor(range / DAY);
					});

					const handleResize = (side: 'left' | 'right', e: PointerEvent) => {
						e.preventDefault();
						const x = e.clientX;
						const initialStart = current().start;
						const initialEnd = current().end;
						const isFloating = current().floating;

						const onMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();
							const dx = moveEvent.clientX - x;
							const gantt = document.getElementById('gantt');

							if (gantt) {
								const cellWidth = gantt.getBoundingClientRect().width / cols();
								const cellsTraversed = Math.round(dx / cellWidth);
								const offset = cellsTraversed * DAY;

								if (side === 'left') {
									const newStart = initialStart + offset;
									if (minStart() && (minStart() as number) > newStart) {
										setValid(false);
									} else {
										setValid(true);
										if (newStart >= gridStartDate() && newStart < initialEnd) {
											tasks.update(task.id, { start: newStart });
										}
									}
								} else {
									const newEnd = initialEnd + offset;
									if (newEnd <= gridEndDate() && newEnd > initialStart) {
										if (isFloating) {
											tasks.update(task.id, {
												start: initialStart,
												end: newEnd,
											});
										} else {
											tasks.update(task.id, { end: newEnd });
										}
									}
								}
							}
						};

						const onUp = () => {
							document.removeEventListener('pointermove', onMove);
							document.removeEventListener('pointerup', onUp);
							setValid(true);
						};

						document.addEventListener('pointermove', onMove);
						document.addEventListener('pointerup', onUp);
					};

					const handleMove = (e: PointerEvent) => {
						e.preventDefault();
						const x = e.clientX;
						const startPos = current().start;

						const handleMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();
							const dx = moveEvent.clientX - x;
							// const gantt = ganttRef();
							const gantt = document.getElementById('gantt');

							if (gantt) {
								const cellWidth = gantt.getBoundingClientRect().width / cols();
								const cellsTraversed = Math.round(dx / cellWidth);
								const offset = cellsTraversed * DAY;
								const newStart = startPos + offset;
								const newEnd = newStart + (current().end - current().start);

								if (minStart() && (minStart() as number) > newStart)
									setValid(false);
								else setValid(true);

								if (newStart >= gridStartDate() && newEnd <= gridEndDate()) {
									tasks.update(task.id, {
										start: newStart,
										end: newEnd,
									});
								}
							}
						};

						const handleRelease = () => {
							document.removeEventListener('pointermove', handleMove);
							document.removeEventListener('pointerup', handleRelease);
							setValid(true);
						};

						document.addEventListener('pointermove', handleMove);
						document.addEventListener('pointerup', handleRelease);
					};

					const gantt = createMemo(() => ({
						width: `${cols() * zoomModifier()}rem`,
						display: 'grid',
						'grid-template-columns': `repeat(${cols()}, 1fr)`,
						'background-image':
							'linear-gradient(to right, #ccc 1px, transparent 1px)',
						'background-size': `${100 / cols()}% 100%`,
						'border-bottom': '1px solid #ccc',
					}));

					const ganttItemWrapper = createMemo(() => ({
						height: '3rem',
						margin: '.5rem 0 .5rem 0',
						display: 'grid',
						'grid-column': `${colStart()} / span ${colSpan()}`,
						'grid-template-areas': '"left-handle main right-handle"',
						'grid-template-columns': 'auto 1fr auto',
						'align-items': 'center',
					}));

					const ganttItemHandle = {
						width: '.5rem',
						cursor: 'ew-resize',
						'background-color': '#666',
						'align-self': 'stretch',
					} as const;

					const backgroundColor = createMemo(() => {
						return !current().floating
							? valid()
								? 'white'
								: '#F9D2DD'
							: 'lightGray';
					});

					const ganttItem = createMemo(() => {
						return {
							border: `.15rem ${current().floating ? 'dashed' : 'solid'} gray`,
							'border-width': current().floating ? '.25rem' : '.15rem',
							'border-left': 'none',
							'border-right': 'none',
							cursor: 'pointer',
							overflow: 'hidden',
							background: backgroundColor(),
							display: 'flex',
							'align-items': 'center',
							'justify-content': 'center',
							'align-self': 'stretch',
						};
					});

					return (
						<div style={gantt()} id="gantt">
							<div style={ganttItemWrapper()}>
								<div
									style={ganttItemHandle}
									onPointerDown={[handleResize, 'left']}
								/>
								<div style={ganttItem()} onPointerDown={handleMove}>
									{formatTime(current().start)} - {formatTime(current().end)}
								</div>
								<div
									style={ganttItemHandle}
									onPointerDown={[handleResize, 'right']}
								/>
							</div>
						</div>
					);
				}}
			</For>
		</div>
	);
};
