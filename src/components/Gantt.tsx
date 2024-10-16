import {
	For,
	onMount,
	onCleanup,
	createMemo,
	createSignal,
	type Accessor,
} from 'solid-js';
import { DAY, MONTH, WEEK } from '@solid-primitives/date';
import { tasks, type Task } from '@features/Task';
import { formatTime } from '../lib/dates';

export const Gantt = (props: { tasks: Task[] }) => {
	const [cols] = createSignal(180);
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
		const date = new Date(Date.now() - MONTH);
		return Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
		);
	});

	const gridEndDate = createMemo(() => gridStartDate() + cols() * DAY);

	console.log(formatTime(gridAnchorDate()));

	const [ganttRef, setGanttRef] = createReactiveRef();
	const [ganttWrapperRef, setGanttWrapperRef] = createReactiveRef();

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 1;
		const MAX_ZOOM = 12;
		const SENSITIVITY = 0.001;

		if (e.ctrlKey) {
			e.preventDefault();
			const ganttWrapper = ganttWrapperRef();
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
		const ganttWrapper = ganttWrapperRef();
		if (ganttWrapper) {
			const gantt = ganttRef();
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
			ref={setGanttWrapperRef}
		>
			<For each={tasksWithinRange()}>
				{(task) => {
					const [posOffset, setPosOffset] = createSignal(0);
					const [rightOffset, setRightOffset] = createSignal(0);
					const [leftOffset, setLeftOffset] = createSignal(0);
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

					const current = createMemo(() => ({
						...task,
						start: task.start || gridAnchorDate() + DAY,
						end: task.end || gridAnchorDate() + DAY + WEEK,
						floating: !!task.start,
					}));

					const colStart = createMemo(() => {
						const time =
							current().start - gridStartDate() + posOffset() + leftOffset();
						return Math.floor(time / DAY);
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

						const onMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();
							const dx = moveEvent.clientX - x;
							const gantt = ganttRef();
							if (gantt) {
								const cellWidth = gantt.getBoundingClientRect().width / cols();
								const cellsTraversed = Math.round(dx / cellWidth);
								const offset = start + cellsTraversed * DAY;

								if (side === 'left') {
									const newStart = current().start + offset;
									if (minStart() && (minStart() as number) > newStart)
										setValid(false);
									else setValid(true);
									if (newStart >= gridStartDate() && newStart < current().end) {
										setLeftOffset(offset);
									}
								}

								if (side === 'right') {
									const newEnd = current().end + offset;
									if (newEnd <= gridEndDate() && newEnd > current().start) {
										setRightOffset(offset);
									}
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

							if (newEnd > newStart) {
								tasks.update(task.id, {
									start: newStart,
									end: newEnd,
								});
							}

							setLeftOffset(0);
							setRightOffset(0);
							setValid(true);
						};

						document.addEventListener('pointermove', onMove);
						document.addEventListener('pointerup', onUp);
					};

					const handleMove = (e: PointerEvent) => {
						e.preventDefault();
						const x = e.clientX;
						const start = posOffset();

						const handleMove = (moveEvent: PointerEvent) => {
							moveEvent.preventDefault();

							const dx = moveEvent.clientX - x;
							const gantt = ganttRef();
							if (gantt) {
								const cellWidth = gantt.getBoundingClientRect().width / cols();
								const cellsTraversed = Math.round(dx / cellWidth);
								const offset = start + cellsTraversed * DAY;
								const newStart = current().start + offset;
								const newEnd = current().end + offset;

								if (minStart() && (minStart() as number) > newStart)
									setValid(false);
								else setValid(true);

								if (newStart >= gridStartDate() && newEnd <= gridEndDate()) {
									setPosOffset(offset);
								}
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
						return current().floating
							? valid()
								? 'white'
								: '#F9D2DD'
							: 'lightGray';
					});

					const ganttItem = createMemo(() => {
						const isFloating = current().floating;
						return {
							border: `.15rem ${isFloating ? 'solid' : 'dashed'} gray`,
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
						<div style={gantt()} id="gantt" ref={setGanttRef}>
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

const createReactiveRef = <T extends HTMLElement>(): [
	Accessor<T | undefined>,
	(el: T) => void,
] => {
	const [ref, setRef] = createSignal<T>();

	const refCallback = (el: T | undefined) => {
		if (el) {
			setRef(() => el);

			onMount(() => {
				const updateRef = () => setRef(() => el);
				updateRef();

				const observer = new MutationObserver(updateRef);
				observer.observe(el, {
					attributes: true,
					childList: true,
					subtree: true,
				});

				onCleanup(() => observer.disconnect());
			});
		}
	};

	return [ref, refCallback];
};
