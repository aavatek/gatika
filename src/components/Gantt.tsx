import type { Accessor } from 'solid-js';
import { onMount, createMemo, createSignal, Show, For } from 'solid-js';
import { tasks, type Task } from '@features/Task';
import { DAY, WEEK } from '@lib/dates';
import { getWeekNumber, getWeekStart, Weekdays, Months } from '@lib/dates';
import * as stylex from '@stylexjs/stylex';

export const Gantt = (props: { tasks: Task[] }) => {
	const gridAnchorDate = getWeekStart(Date.now() - WEEK * 2);
	const gridStartDate = getWeekStart(Date.now() - WEEK * 20);
	const gridEndDate = getWeekStart(Date.now() + WEEK * 20);

	const [zoomModifier, setZoomModifier] = createSignal(24);
	const tasksWithinRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate)
			.filter((task) => !task.end || task.end < gridEndDate),
	);

	const rows = createMemo(() => tasksWithinRange().length);
	const cols = createMemo(() => (gridEndDate - gridStartDate) / DAY);
	const colWidth = createMemo(() => (cols() * zoomModifier()) / cols());

	const handleZoom = (e: WheelEvent) => {
		const MIN_ZOOM = 16;
		const MAX_ZOOM = 192;
		const SENSITIVITY = 0.001;

		if (e.ctrlKey) {
			e.preventDefault();
			const wrapper = document.getElementById('wrapper');
			if (wrapper) {
				const rect = wrapper.getBoundingClientRect();
				const mouseX = e.clientX - rect.left + wrapper.scrollLeft;

				const zoomFactor = Math.exp(-e.deltaY * SENSITIVITY);
				const newZoomLevel = Math.max(
					MIN_ZOOM,
					Math.min(MAX_ZOOM, zoomModifier() * zoomFactor),
				);

				const newWidth = cols() * newZoomLevel;
				const ratio = mouseX / (cols() * zoomModifier());
				const newScrollLeft = ratio * newWidth - (e.clientX - rect.left);

				setZoomModifier(newZoomLevel);
				wrapper.scrollLeft = newScrollLeft;
			}
		}
	};

	onMount(() => {
		const wrapper = document.getElementById('wrapper');
		if (wrapper) {
			wrapper.scrollLeft =
				((gridAnchorDate - gridStartDate - DAY * 2) / DAY) * colWidth();
		}
	});

	return (
		<div id="wrapper" onWheel={handleZoom} {...stylex.props(styles.wrapper)}>
			<Timeline
				cols={cols}
				colWidth={colWidth}
				zoomModifier={zoomModifier}
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
			/>

			<div {...stylex.props(styles.gantt(cols, rows, zoomModifier))}>
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
	const task = createMemo(() => ({
		...props.task,
		start: props.task.start ?? props.gridAnchorDate,
		end: props.task.end ?? props.gridAnchorDate + WEEK,
		floating: !props.task.start,
	}));

	const colStart = createMemo(() => {
		const taskStartDay = Math.floor(task().start / DAY);
		const gridStartDay = Math.floor(props.gridStartDate / DAY);
		return taskStartDay - gridStartDay;
	});

	const colSpan = createMemo(() => {
		const range = task().end - task().start;
		return Math.floor(range / DAY);
	});

	const handleDrag = (mode: 'move' | 'left' | 'right') => (e: PointerEvent) => {
		e.preventDefault();
		const x = e.clientX;
		const { start, end } = task();

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
				tasks.update(task().id, {
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

	return (
		<div {...stylex.props(styles.taskWrapper(props.row, colStart, colSpan))}>
			<span
				{...stylex.props(styles.taskHandle('left'))}
				onPointerDown={handleDrag('left')}
			/>
			<span
				{...stylex.props(styles.task(task))}
				onPointerDown={handleDrag('move')}
				innerText={task().name}
			/>
			<span
				{...stylex.props(styles.taskHandle('right'))}
				onPointerDown={handleDrag('right')}
			/>
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
				{(month) => (
					<div {...stylex.props(styles.months(month))}>{Months[month.num]}</div>
				)}
			</For>
			<Show when={props.zoomModifier() >= 45}>
				<For each={days()}>
					{(day, index) => (
						<div {...stylex.props(styles.days(index))}>
							<span>{day.num}</span>
							<span>{day.day}</span>
						</div>
					)}
				</For>
			</Show>
			<Show when={props.zoomModifier() < 45}>
				<For each={weeks()}>
					{(week, index) => (
						<div {...stylex.props(styles.weeks(index))}>Week {week}</div>
					)}
				</For>
			</Show>
		</div>
	);
};

const styles = stylex.create({
	timeLine: (cols, zoomModifier) => ({
		width: `${cols() * zoomModifier()}px`,
		display: 'grid',
		gridTemplateColumns: `repeat(${cols()}, 1fr)`,
		borderBottom: '1px solid #ccc',
	}),

	days: (index) => ({
		height: '3rem',
		gridColumn: `${index} / span 1`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center',
		background: 'white',
	}),

	weeks: (index) => ({
		height: '3rem',
		gridColumn: `${index() * 7 + 1} / span 7`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'white',
	}),

	months: (month) => ({
		height: '3rem',
		gridColumn: `${month.startColumn} / span ${month.days}`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'white',
	}),

	wrapper: {
		overflowX: 'auto',
		border: '2px solid black',
		margin: '1rem',
	},

	gantt: (cols, rows, zoomModifier) => ({
		width: `${cols() * zoomModifier()}px`,
		display: 'grid',
		gridTemplateColumns: `repeat(${cols()}, 1fr)`,
		gridTemplateRows: `repeat(${rows()}, 1fr)`,
		backgroundSize: `${100 / cols()}% ${100 / rows()}%`,
		backgroundImage: 'linear-gradient(to right, #e0e0e0 1px, transparent 1px)',
	}),

	taskWrapper: (row, colStart, colSpan) => ({
		height: '2rem',
		margin: '.4rem 0 .4rem 0',
		display: 'grid',
		gridRow: row() + 1,
		gridColumn: `${colStart()} / span ${colSpan()}`,
		gridTemplateAreas: '"left-handle main right-handle"',
		gridTemplateColumns: 'auto 1fr auto',
		alignItems: 'center',
	}),

	task: (current) => ({
		border: `.15rem ${current().floating ? 'dashed' : 'solid'} gray`,
		borderWidth: current().floating ? '.25rem' : '.15rem',
		borderLeft: 'none',
		borderRight: 'none',
		cursor: 'pointer',
		overflow: 'hidden',
		background: 'white',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'stretch',
	}),

	taskHandle: (side) => ({
		width: '.5rem',
		cursor: 'ew-resize',
		backgroundColor: '#666',
		alignSelf: 'stretch',
		borderRadius: side === 'left' ? '4px 0 0 4px' : '0 4px 4px 0',
	}),
});
