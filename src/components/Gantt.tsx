import { createMemo, createSignal, For, onMount } from 'solid-js';
import { DAY, getDate, MONTH, WEEK } from '@solid-primitives/date';
import { tasks, type Task } from '@features/Task';

export type GanttTask = {
	id: Task['id'];
	name: string;
	start?: number | null;
	end?: number | null;
};

export const Gantt = (props: { tasks: GanttTask[] }) => {
	const earliestStartDate = createMemo(() => {
		return Math.min(
			...props.tasks
				.filter((task) => task.start)
				.map((task) => task.start as number),
		);
	});

	const [cols] = createSignal(180);
	const gridStartDate = earliestStartDate() - MONTH;
	const gridEndDate = createMemo(() => gridStartDate + cols() * DAY);
	const [viewStartDate] = createSignal(Date.now() - WEEK * 2);
	const [zoomModifier, setZoomModifier] = createSignal(2);

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 1;
		const MAX_ZOOM = 12;
		const ZOOM_SENSITIVITY = 0.001;

		if (e.ctrlKey) {
			e.preventDefault();
			const ganttElement = document.getElementById('gantt') as HTMLElement;
			const ganttWrapper = ganttElement.parentElement as HTMLElement;

			const rect = ganttWrapper.getBoundingClientRect();
			const mouseX = e.clientX - rect.left + ganttWrapper.scrollLeft;

			const zoomFactor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY);
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
	};

	onMount(() => {
		const ganttElement = document.getElementById('gantt') as HTMLElement;
		const cellWidth = ganttElement.getBoundingClientRect().width / cols();
		const viewAnchor = viewStartDate();
		const scrollPosition = ((viewAnchor - gridStartDate) / DAY) * cellWidth;
		const ganttWrapper = ganttElement.parentElement as HTMLElement;
		ganttWrapper.scrollLeft = scrollPosition;
	});

	return (
		<div onWheel={handleZoom} style={{ 'overflow-x': 'auto' }}>
			<For each={props.tasks}>
				{(task) => {
					const [posOffset, setPosOffset] = createSignal(0);
					const [rightOffset, setRightOffset] = createSignal(0);
					const [leftOffset, setLeftOffset] = createSignal(0);

					const colStart = createMemo(() => {
						const time = task.start
							? task.start - gridStartDate + posOffset() + leftOffset()
							: viewStartDate() - gridStartDate + posOffset() + leftOffset();
						return Math.ceil((time + DAY) / DAY);
					});

					const colSpan = createMemo(() => {
						const range =
							task.start && task.end
								? task.end - task.start - leftOffset() + rightOffset()
								: WEEK - leftOffset() + rightOffset();
						return Math.floor(range / DAY);
					});

					const handleResize = (side: 'left' | 'right', e: PointerEvent) => {
						e.preventDefault();
						const x = e.clientX;
						const start = side === 'left' ? leftOffset() : rightOffset();
						const gantt = document.getElementById('gantt') as HTMLElement;
						const cellWidth = gantt?.getBoundingClientRect().width / cols();

						const onMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();
							const dx = moveEvent.clientX - x;
							const cellsTraversed = Math.round(dx / cellWidth);
							const offset = start + cellsTraversed * DAY;

							const baseStart = task.start || viewStartDate();
							const baseEnd = task.end || baseStart + WEEK;

							if (side === 'left') {
								const newStart = baseStart + offset;
								if (newStart >= gridStartDate && newStart < baseEnd - DAY) {
									setLeftOffset(offset);
								}
							}

							if (side === 'right') {
								const newEnd = baseEnd + offset;
								if (newEnd <= gridEndDate() && newEnd > baseStart + DAY) {
									setRightOffset(offset);
								}
							}
						};

						const onUp = () => {
							document.removeEventListener('pointermove', onMove);
							document.removeEventListener('pointerup', onUp);

							const baseStart = task.start || viewStartDate();
							const baseEnd = task.end || baseStart + WEEK;

							const newStart = getDate(
								baseStart + (side === 'left' ? leftOffset() : 0),
							);

							const newEnd = getDate(
								baseEnd + (side === 'right' ? rightOffset() : 0),
							);

							tasks.update(task.id, {
								start: newStart,
								end: newEnd,
							});

							setLeftOffset(0);
							setRightOffset(0);
						};

						document.addEventListener('pointermove', onMove);
						document.addEventListener('pointerup', onUp);
					};

					const handleMove = (e: PointerEvent) => {
						e.preventDefault();
						const x = e.clientX;
						const start = posOffset();
						const gantt = document.getElementById('gantt') as HTMLDivElement;
						const cellWidth = gantt?.getBoundingClientRect().width / cols();

						const handleMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();

							const dx = moveEvent.clientX - x;
							const cellsTraversed = Math.round(dx / cellWidth);
							const offset = start + cellsTraversed * DAY;
							const currStart = task.start || viewStartDate();
							const currEnd = task.end || viewStartDate() + WEEK;
							const newStart = currStart + offset;
							const newEnd = currEnd + offset;

							if (newStart >= gridStartDate && newEnd <= gridEndDate()) {
								setPosOffset(offset);
							}
						};

						const handleRelease = () => {
							document.removeEventListener('pointermove', handleMove);
							document.removeEventListener('pointerup', handleRelease);

							const currStart = task.start || viewStartDate();
							const currEnd = task.end || viewStartDate() + WEEK;

							const newStart = getDate(currStart + posOffset());
							const newEnd = getDate(currEnd + posOffset());

							tasks.update(task.id, {
								start: newStart,
								end: newEnd,
							});

							setPosOffset(0);
						};

						document.addEventListener('pointermove', handleMove);
						document.addEventListener('pointerup', handleRelease);
					};

					const row = createMemo(() => ({
						width: `${cols() * zoomModifier()}rem`,
						display: 'grid',
						'grid-template-columns': `repeat(${cols()}, 1fr)`,
						'background-image':
							'linear-gradient(to right, #ccc 1px, transparent 1px)',
						'background-size': `${100 / cols()}% 100%`,
						'border-bottom': '1px solid #ccc',
					}));

					const rowItem = createMemo(() => ({
						'grid-column': `${colStart()} / span ${colSpan()}`,
						height: '4rem',
						display: 'grid',
						'grid-template-areas': '"left-handle main right-handle"',
						'grid-template-columns': 'auto 1fr auto',
						'align-items': 'center',
					}));

					const handleStyle = {
						width: '.5rem',
						height: '75%',
						'background-color': '#666',
						cursor: 'ew-resize',
					} as const;

					const itemStyle = createMemo(() => ({
						border: task.start ? '1px solid black' : '2px dashed black',
						background: task.start ? 'white' : 'lightgray',
						'border-left': 'none',
						'border-right': 'none',
						display: 'flex',
						'align-items': 'center',
						'justify-content': 'center',
						cursor: 'pointer',
						height: '80%',
						overflow: 'hidden',
					}));

					return (
						<div style={row()} id="gantt">
							<div style={rowItem()}>
								<div
									style={handleStyle}
									onPointerDown={[handleResize, 'left']}
								/>
								<div style={itemStyle()} onPointerDown={handleMove}>
									{task.name}
								</div>
								<div
									style={handleStyle}
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
