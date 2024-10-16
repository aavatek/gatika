import { createMemo, createSignal, For, onMount } from 'solid-js';
import { DAY, MONTH, WEEK } from '@solid-primitives/date';
import { tasks, type Task } from '@features/Task';

export const Gantt = (props: { tasks: Task[] }) => {
	const [cols] = createSignal(180);
	const [zoomModifier, setZoomModifier] = createSignal(2);

	const gridStartDate = Date.now() - MONTH;
	const gridEndDate = createMemo(() => gridStartDate + cols() * DAY);
	const gridAnchorDate = Date.now() - WEEK * 2;

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 1;
		const MAX_ZOOM = 12;
		const SENSITIVITY = 0.001;

		if (e.ctrlKey) {
			e.preventDefault();
			const ganttElement = document.getElementById('gantt') as HTMLElement;
			const ganttWrapper = ganttElement.parentElement as HTMLElement;

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
	};

	onMount(() => {
		const ganttElement = document.getElementById('gantt') as HTMLElement;
		const ganttWrapper = ganttElement.parentElement as HTMLElement;
		const cellWidth = ganttElement.getBoundingClientRect().width / cols();
		const scrollPosition = ((gridAnchorDate - gridStartDate) / DAY) * cellWidth;
		ganttWrapper.scrollLeft = scrollPosition;
	});

	return (
		<div onWheel={handleZoom} style={{ 'overflow-x': 'auto' }}>
			<For each={props.tasks}>
				{(task) => {
					const [posOffset, setPosOffset] = createSignal(0);
					const [rightOffset, setRightOffset] = createSignal(0);
					const [leftOffset, setLeftOffset] = createSignal(0);

					const current = createMemo(() => ({
						id: task.id,
						name: task.name,
						start: task.start || gridAnchorDate,
						end: task.end || gridAnchorDate + WEEK,
						floating: !!task.start,
					}));

					const colStart = createMemo(() => {
						const time =
							current().start - gridStartDate + posOffset() + leftOffset();
						return Math.floor((time + DAY) / DAY);
					});

					const colSpan = createMemo(() => {
						const range =
							current().end - current().start - leftOffset() + rightOffset();
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

							if (side === 'left') {
								const newStart = current().start + offset;
								if (
									newStart >= gridStartDate &&
									newStart < current().end - DAY
								) {
									setLeftOffset(offset);
								}
							}

							if (side === 'right') {
								const newEnd = current().end + offset;
								if (newEnd <= gridEndDate() && newEnd > current().start + DAY) {
									setRightOffset(offset);
								}
							}
						};

						const onUp = () => {
							document.removeEventListener('pointermove', onMove);
							document.removeEventListener('pointerup', onUp);

							const newStart =
								current().start + (side === 'left' ? leftOffset() : 0);
							const newEnd =
								current().end + (side === 'right' ? rightOffset() : 0);

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
							const newStart = current().start + offset;
							const newEnd = current().end + offset;

							if (newStart >= gridStartDate && newEnd <= gridEndDate()) {
								setPosOffset(offset);
							}
						};

						const handleRelease = () => {
							document.removeEventListener('pointermove', handleMove);
							document.removeEventListener('pointerup', handleRelease);

							tasks.update(task.id, {
								start: current().start + posOffset(),
								end: current().end + posOffset(),
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
