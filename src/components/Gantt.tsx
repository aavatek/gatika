import {
	For,
	onMount,
	createMemo,
	createSignal,
	Show,
	type Accessor,
} from 'solid-js';
import { tasks, type Task } from '@features/Task';
import { Weekdays, DAY, WEEK, Months, getStartOfWeek } from '@lib/dates';

type TimelineProps = {
	gridStartDate: number;
	gridEndDate: number;
	zoomModifier: Accessor<number>;
	cols: Accessor<number>;
	colWidth: Accessor<number>;
};

const Timeline = (props: TimelineProps) => {
	const timelineWrapper = createMemo(() => ({
		width: `${props.cols() * props.zoomModifier()}px`,
		display: 'grid',
		'grid-template-columns': `repeat(${props.cols()}, 1fr)`,
		'border-bottom': '1px solid #ccc',
	}));

	const days = createMemo(() => {
		const totalDays = props.cols();
		const days = [];
		let currentDate = new Date(props.gridStartDate + DAY);

		for (let i = 0; i < totalDays; i++) {
			const day = currentDate.getDay();
			const dayNumber = currentDate.getDate();
			days.push({ day: Weekdays[day], num: dayNumber });
			currentDate = new Date(currentDate.getTime() + DAY);
		}

		return days;
	});

	const weeks = createMemo(() => {
		const totalDays = props.cols();
		const weeks = [];
		let currentDate = new Date(props.gridStartDate + DAY * 2);

		for (let i = 0; i < totalDays; i += 7) {
			weeks.push(getWeekNumber(currentDate));
			currentDate = new Date(currentDate.getTime() + 7 * DAY);
		}

		return weeks;
	});

	function getWeekNumber(dd: Date): number {
		const d = new Date(Date.UTC(dd.getFullYear(), dd.getMonth(), dd.getDate()));
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	}

	const months = createMemo(() => {
		const months = [];
		let currentDate = new Date(props.gridStartDate + DAY);
		const endDate = new Date(props.gridEndDate + DAY);
		let totalDays = 0;

		while (currentDate < endDate) {
			const month = currentDate.getMonth();
			const year = currentDate.getFullYear();
			const nextMonth = new Date(year, month + 1, 1);

			const monthEndDate = new Date(
				Math.min(nextMonth.getTime(), endDate.getTime()),
			);

			const daysInThisMonth =
				(monthEndDate.getTime() - currentDate.getTime()) / DAY;

			months.push({
				num: month,
				days: Math.round(daysInThisMonth),
				startColumn: totalDays + 1,
			});

			totalDays += Math.round(daysInThisMonth);
			currentDate = nextMonth;
		}

		return months;
	});

	return (
		<div style={timelineWrapper()}>
			<For each={months()}>
				{(month) => {
					const style = createMemo(() => ({
						height: '3rem',
						'grid-column': `${month.startColumn} / span ${month.days}`,
						border: '1px solid black',
						display: 'flex',
						'justify-content': 'center',
						'align-items': 'center',
						background: 'white',
					}));

					return <div style={style()}>{Months[month.num]}</div>;
				}}
			</For>
			<Show when={props.zoomModifier() >= 45}>
				<For each={days()}>
					{(day, index) => {
						const style = createMemo(() => ({
							height: '3rem',
							'grid-column': `${index} / span 1`,
							border: '1px solid black',
							display: 'flex',
							'flex-direction': 'column',
							'justify-content': 'center',
							'align-items': 'center',
							background: 'white',
						}));

						return (
							<div style={style()}>
								<span>{day.num}</span>
								<span>{day.day}</span>
							</div>
						);
					}}
				</For>
			</Show>
			<Show when={props.zoomModifier() < 45}>
				<For each={weeks()}>
					{(week, index) => {
						const style = createMemo(() => ({
							height: '3rem',
							'grid-column': `${index() * 7 + 1} / span 7`,
							border: '1px solid black',
							display: 'flex',
							'justify-content': 'center',
							'align-items': 'center',
							background: 'white',
						}));

						return <div style={style()}>Week {week}</div>;
					}}
				</For>
			</Show>
		</div>
	);
};

export const Gantt = (props: { tasks: Task[] }) => {
	const gridAnchorDate = getStartOfWeek(Date.now() - WEEK * 2);
	const gridStartDate = getStartOfWeek(Date.now() - WEEK * 20);
	const gridEndDate = getStartOfWeek(Date.now() + WEEK * 20);

	const [zoomModifier, setZoomModifier] = createSignal(24);

	const cols = createMemo(() => (gridEndDate - gridStartDate) / DAY);
	const colWidth = createMemo(() => (cols() * zoomModifier()) / cols());

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 16;
		const MAX_ZOOM = 192;
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
		const gantt = document.getElementById('ganttWrapper');
		if (gantt) {
			gantt.scrollLeft =
				((gridAnchorDate - gridStartDate - DAY * 2) / DAY) * colWidth();
		}
	});

	const tasksWithinRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate)
			.filter((task) => !task.end || task.end < gridEndDate),
	);

	return (
		<div
			onWheel={handleZoom}
			style={{
				'overflow-x': 'auto',
				border: '2px solid black',
				margin: '1rem',
			}}
			id="ganttWrapper"
		>
			<Timeline
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
				cols={cols}
				colWidth={colWidth}
				zoomModifier={zoomModifier}
			/>

			<For each={tasksWithinRange()}>
				{(task) => {
					const current = createMemo(() => {
						return {
							...task,
							start: task.start ?? gridAnchorDate,
							end: task.end ?? gridAnchorDate + WEEK,
							floating: !task.start,
						};
					});

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
						const taskStartDay = Math.floor(current().start / DAY);
						const gridStartDay = Math.floor(gridStartDate / DAY);
						return taskStartDay - gridStartDay;
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
										if (newStart >= gridStartDate && newStart < initialEnd) {
											tasks.update(task.id, { start: newStart });
										}
									}
								} else {
									const newEnd = initialEnd + offset;
									if (newEnd <= gridEndDate && newEnd > initialStart) {
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

								if (newStart >= gridStartDate && newEnd <= gridEndDate) {
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
						width: `${cols() * zoomModifier()}px`,
						display: 'grid',
						'grid-template-columns': `repeat(${cols()}, 1fr)`,
						'background-image':
							'linear-gradient(to right, #f0f0f0 1px, transparent 1px)',
						'background-size': `${100 / cols()}% 100%`,
						'border-bottom': '1px solid #f0f0f0',
					}));

					const ganttItemWrapper = createMemo(() => ({
						height: '2rem',
						margin: '.4rem 0 .4rem 0',
						display: 'grid',
						'grid-column': `${colStart()} / span ${colSpan()}`,
						'grid-template-areas': '"left-handle main right-handle"',
						'grid-template-columns': 'auto 1fr auto',
						'align-items': 'center',
					}));

					const ganttItemHandleLeft = {
						width: '.5rem',
						cursor: 'ew-resize',
						'background-color': '#666',
						'align-self': 'stretch',
						'border-radius': '4px 0 0 4px',
					} as const;

					const ganttItemHandleRight = {
						width: '.5rem',
						cursor: 'ew-resize',
						'background-color': '#666',
						'align-self': 'stretch',
						'border-radius': '0 4px 4px 0',
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
									style={ganttItemHandleLeft}
									onPointerDown={[handleResize, 'left']}
								/>
								<div style={ganttItem()} onPointerDown={handleMove}>
									{current().name}
								</div>
								<div
									style={ganttItemHandleRight}
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
