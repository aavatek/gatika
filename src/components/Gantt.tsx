import type { Accessor } from 'solid-js';
import { onMount, createMemo, createSignal, Show, For } from 'solid-js';
import { tasks, type Task } from '@features/Task';
import { getStartOfWeek, Weekdays, Months, DAY, WEEK } from '@lib/dates';

export const Gantt = (props: { tasks: Task[] }) => {
	const gridAnchorDate = getStartOfWeek(Date.now() - WEEK * 2);
	const gridStartDate = getStartOfWeek(Date.now() - WEEK * 20);
	const gridEndDate = getStartOfWeek(Date.now() + WEEK * 20);

	const [zoomModifier, setZoomModifier] = createSignal(24);

	const rows = createMemo(() => props.tasks.length);
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

	const gantt = createMemo(() => ({
		width: `${cols() * zoomModifier()}px`,
		display: 'grid',
		'grid-template-columns': `repeat(${cols()}, 1fr)`,
		'grid-template-rows': `repeat(${rows()}, 1fr)`,
		'background-size': `${100 / cols()}% ${100 / rows()}%`,
		'background-image': `
      linear-gradient(to right, #e0e0e0 1px, transparent 1px),
      linear-gradient(to bottom, #fff 1px, transparent 1px)
    `,
	}));

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

			<div style={gantt()}>
				<For each={tasksWithinRange()}>
					{(task, row) => (
						<GanttTask
							task={task}
							row={row}
							colWidth={colWidth}
							gridAnchorDate={gridAnchorDate}
							gridStartDate={gridStartDate}
							gridEndDate={gridEndDate}
						/>
					)}
				</For>
			</div>
		</div>
	);
};

type GanttTaskProps = {
	task: Task;
	row: Accessor<number>;
	colWidth: Accessor<number>;
	gridAnchorDate: number;
	gridStartDate: number;
	gridEndDate: number;
};

const GanttTask = (props: GanttTaskProps) => {
	const current = createMemo(() => {
		return {
			...props.task,
			start: props.task.start ?? props.gridAnchorDate,
			end: props.task.end ?? props.gridAnchorDate + WEEK,
			floating: !props.task.start,
		};
	});

	const colStart = createMemo(() => {
		const taskStartDay = Math.floor(current().start / DAY);
		const gridStartDay = Math.floor(props.gridStartDate / DAY);
		return taskStartDay - gridStartDay;
	});

	const colSpan = createMemo(() => {
		const range = current().end - current().start;
		return Math.floor(range / DAY);
	});

	const handleDrag = (mode: 'move' | 'left' | 'right') => (e: PointerEvent) => {
		e.preventDefault();
		const x = e.clientX;
		const { start, end } = current();

		const handleMove = (moveEvent: PointerEvent) => {
			moveEvent.preventDefault();
			const dx = moveEvent.clientX - x;
			const offset = Math.round(dx / props.colWidth()) * DAY;

			let { start: newStart, end: newEnd } = { start, end };

			switch (mode) {
				case 'move':
					newStart += offset;
					newEnd += offset;
					break;
				case 'left':
					newStart += offset;
					break;
				case 'right':
					newEnd += offset;
					break;
			}

			const valid =
				newStart >= props.gridStartDate &&
				newEnd <= props.gridEndDate + DAY &&
				newEnd > newStart;

			if (valid) {
				tasks.update(current().id, {
					start: newStart,
					end: newEnd,
				});
			}
		};

		const handleRelease = () => {
			document.removeEventListener('pointermove', handleMove);
			document.removeEventListener('pointerup', handleRelease);
		};

		document.addEventListener('pointermove', handleMove);
		document.addEventListener('pointerup', handleRelease);
	};

	const ganttItemWrapper = createMemo(() => ({
		height: '2rem',
		margin: '.4rem 0 .4rem 0',
		display: 'grid',
		'grid-row': props.row() + 1,
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

	const ganttItem = createMemo(() => {
		return {
			border: `.15rem ${current().floating ? 'dashed' : 'solid'} gray`,
			'border-width': current().floating ? '.25rem' : '.15rem',
			'border-left': 'none',
			'border-right': 'none',
			cursor: 'pointer',
			overflow: 'hidden',
			background: 'white',
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center',
			'align-self': 'stretch',
		};
	});

	return (
		<div style={ganttItemWrapper()}>
			<span style={ganttItemHandleLeft} onPointerDown={handleDrag('left')} />
			<span style={ganttItem()} onPointerDown={handleDrag('move')}>
				{current().name}
			</span>
			<span style={ganttItemHandleRight} onPointerDown={handleDrag('right')} />
		</div>
	);
};

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
		let currentDate = new Date(props.gridStartDate + DAY);

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
		let currentDate = new Date(props.gridStartDate);
		const endDate = new Date(props.gridEndDate);
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
						border: '1px solid gray',
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
							border: '1px solid gray',
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
							border: '1px solid gray',
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
