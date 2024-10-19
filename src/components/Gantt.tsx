import type { Accessor } from 'solid-js';
import {
	onMount,
	createMemo,
	createSignal,
	For,
	Switch,
	Match,
	Show,
} from 'solid-js';
import { TaskEditForm, tasks, type Task } from '@features/Task';
import { DAY, WEEK } from '@lib/dates';
import { getWeekNumber, Weekdays, Months } from '@lib/dates';
import * as sx from '@stylexjs/stylex';
import { Portal } from 'solid-js/web';
import { Button } from './Form';
import { formatDate } from '@solid-primitives/date';

export const Gantt = (props: { tasks: Task[] }) => {
	const gridStartDate = createMemo(() => Date.now() - WEEK * 20);
	const gridEndDate = createMemo(() => Date.now() + WEEK * 20);
	const gridAnchorDate = createMemo(() => Date.now() - DAY * 10);

	const [zoom, setZoom] = createSignal(45);
	const tasksWithinRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate())
			.filter((task) => !task.end || task.end < gridEndDate() + DAY),
	);

	const gridRows = createMemo(() => Math.max(tasksWithinRange().length, 15));
	const gridCols = createMemo(() => (gridEndDate() - gridStartDate()) / DAY);
	const gridColWidth = createMemo(() => (gridCols() * zoom()) / gridCols());

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
					Math.min(MAX_ZOOM, zoom() * zoomFactor),
				);

				const newWidth = gridCols() * newZoomLevel;
				const ratio = mouseX / (gridCols() * zoom());
				const newScrollLeft = ratio * newWidth - (e.clientX - rect.left);

				setZoom(newZoomLevel);
				wrapper.scrollLeft = newScrollLeft;
			}
		}
	};

	onMount(() => {
		const wrapper = document.getElementById('wrapper');
		if (wrapper) {
			wrapper.scrollLeft =
				((gridAnchorDate() - gridStartDate() - DAY * 2) / DAY) * gridColWidth();
		}
	});

	return (
		<div id="wrapper" onWheel={handleZoom} {...sx.props(styles.wrapper)}>
			<Timeline
				cols={gridCols}
				colWidth={gridColWidth}
				zoomModifier={zoom}
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
			/>

			<div {...sx.props(styles.gantt(gridCols, gridRows, zoom))}>
				<For each={tasksWithinRange()} fallback={<div />}>
					{(task, row) => (
						<GanttTask
							task={task}
							row={row}
							colWidth={gridColWidth}
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
	gridAnchorDate: Accessor<number>;
	gridStartDate: Accessor<number>;
	gridEndDate: Accessor<number>;
};

const GanttTask = (props: GanttTaskProps) => {
	const task = createMemo(() => ({
		...props.task,
		start: props.task.start ?? props.gridAnchorDate(),
		end: props.task.end ?? props.gridAnchorDate() + WEEK,
		floating: !props.task.start,
	}));

	const colStart = createMemo(() => {
		return Math.ceil((task().start - props.gridStartDate()) / DAY);
	});

	const colSpan = createMemo(() => {
		return Math.ceil((task().end - task().start) / DAY);
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
				newStart >= props.gridStartDate() &&
				newEnd <= props.gridEndDate() + DAY &&
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

	const [modalVisible, setModalVisible] = createSignal(false);
	const handleDoubleClick = (e: MouseEvent) => {
		e.preventDefault();
		setModalVisible(true);
	};

	return (
		<div {...sx.props(styles.taskWrapper(props.row, colStart, colSpan))}>
			<span
				{...sx.props(styles.taskHandle('left'))}
				onPointerDown={handleDrag('left')}
			/>
			<span
				{...sx.props(styles.task(task))}
				onPointerDown={handleDrag('move')}
				onDblClick={handleDoubleClick}
			>
				{props.task.name}
			</span>
			<span
				{...sx.props(styles.taskHandle('right'))}
				onPointerDown={handleDrag('right')}
			/>
			<Show when={modalVisible()}>
				<TaskModal id={task().id} handleClose={() => setModalVisible(false)} />
			</Show>
		</div>
	);
};

type TaskModalProps = {
	id: Task['id'];
	handleClose: () => void;
};

const TaskModal = (props: TaskModalProps) => {
	const task = tasks.read(props.id);

	const handleDelete = () => {
		tasks.delete(props.id);
		props.handleClose();
	};

	const handleOverlayClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			props.handleClose();
		}
	};

	return (
		<Show when={task()}>
			{(task) => (
				<Portal mount={document.querySelector('main') as HTMLElement}>
					<div {...sx.props(styles.modalOverlay)} onClick={handleOverlayClick}>
						<div {...sx.props(styles.taskModal)}>
							<TaskEditForm task={task} />
							<Button type="button" label="Close" onClick={props.handleClose} />
							<Button type="button" label="Delete" onClick={handleDelete} />
						</div>
					</div>
				</Portal>
			)}
		</Show>
	);
};

type TimelineProps = {
	gridStartDate: Accessor<number>;
	gridEndDate: Accessor<number>;
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

	const tl = createMemo(() => {
		type Day = {
			dayOfWeek: number;
			dayOfMonth: number;
			colStart: number;
			isToday: boolean;
		};
		type Week = {
			label: number;
			startColumn: number;
			days: number;
			isThisWeek: boolean;
		};
		type Month = { num: number; days: number; startColumn: number };

		const days: Day[] = [];
		const weeks: Week[] = [];
		const months: Month[] = [];

		let currentDate = new Date(props.gridStartDate() + DAY);
		let currentWeek = getWeekNumber(currentDate);
		let colStart = 1;
		let monthStart = colStart;
		let currentMonth = currentDate.getMonth();

		while (currentDate.getTime() < props.gridEndDate() + DAY) {
			const dayOfWeek = currentDate.getDay();
			const dayOfMonth = currentDate.getDate();
			const month = currentDate.getMonth();
			const isToday = formatDate(currentDate) === formatDate(new Date());
			const isThisWeek = currentWeek === getWeekNumber(new Date());

			days.push({
				dayOfWeek,
				dayOfMonth,
				colStart,
				isToday,
			});

			if (dayOfWeek === 1 || colStart === 1) {
				weeks.push({
					label: currentWeek,
					startColumn: colStart,
					days: 0,
					isThisWeek,
				});
			}

			if (month !== currentMonth || colStart === 1) {
				if (colStart > 1) {
					months.push({
						num: currentMonth,
						days: colStart - monthStart,
						startColumn: monthStart,
					});
				}

				currentMonth = month;
				monthStart = colStart;
			}

			weeks[weeks.length - 1].days++;

			if (dayOfWeek === 0) {
				currentWeek = getWeekNumber(new Date(currentDate.getTime() + DAY));
			}

			currentDate = new Date(currentDate.getTime() + DAY);
			colStart++;
		}

		months.push({
			num: currentMonth,
			days: colStart - monthStart,
			startColumn: monthStart,
		});

		return { days, weeks, months };
	});

	return (
		<div style={timelineWrapper()}>
			<For each={tl().months}>
				{(month) => (
					<div {...sx.props(styles.months(month))}>{Months[month.num]}</div>
				)}
			</For>
			<Switch>
				<Match when={props.zoomModifier() >= 45}>
					<For each={tl().days}>
						{(day, index) => (
							<div {...sx.props(styles.days(index, day.isToday))}>
								<span>{day.dayOfMonth}</span>
								<span>{Weekdays[day.dayOfWeek]}</span>
							</div>
						)}
					</For>
				</Match>
				<Match when={props.zoomModifier() < 45}>
					<For each={tl().weeks}>
						{(week) => (
							<div {...sx.props(styles.weeks(week))}>Week {week.label}</div>
						)}
					</For>
				</Match>
			</Switch>
		</div>
	);
};

const styles = sx.create({
	timeLine: (cols, zoomModifier) => ({
		width: `${cols() * zoomModifier()}px`,
		display: 'grid',
		gridTemplateColumns: `repeat(${cols()}, 1fr)`,
		borderBottom: '1px solid #ccc',
	}),

	days: (index, isToday) => ({
		height: '3rem',
		gridColumn: `${index() + 1} / span 1`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center',
		background: isToday ? '#ccc' : 'white',
		overflow: 'hidden',
	}),

	weeks: (week) => ({
		height: '3rem',
		gridColumn: `${week.startColumn} / span ${week.days}`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
		background: week.isThisWeek ? '#ccc' : 'white',
	}),

	months: (month) => ({
		height: '3rem',
		gridColumn: `${month.startColumn} / span ${month.days}`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'white',
		overflow: 'hidden',
	}),

	wrapper: {
		overflowX: 'auto',
		border: '2px solid black',
	},

	gantt: (cols, rows, zoomModifier) => ({
		display: 'grid',
		rowGap: '1rem',
		gridTemplateColumns: `repeat(${cols()}, 1fr)`,
		gridTemplateRows: `repeat(${rows()}, 1fr)`,
		width: `${cols() * zoomModifier()}px`,
		height: `${rows() * 3}rem`,
		paddingTop: '1rem',
		paddingBottom: '1rem',
		backgroundSize: `${100 / cols()}%`,
		backgroundImage: 'linear-gradient(to right, #e0e0e0 1px, transparent 1px)',
	}),

	taskWrapper: (row, colStart, colSpan) => ({
		gridRow: row() + 1,
		gridColumn: `${colStart()} / span ${colSpan()}`,
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		alignContent: 'stretch',
		justifyItems: 'stretch',
	}),

	task: (current) => ({
		background: current().floating ? '#f0f0f0' : 'white',
		border: `2px ${current().floating ? 'dashed' : 'solid'} #666`,
		borderLeft: 'none',
		borderRight: 'none',
		cursor: 'pointer',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}),

	taskHandle: (side) => ({
		width: '.5rem',
		cursor: 'ew-resize',
		backgroundColor: '#666',
		borderRadius: side === 'left' ? '4px 0 0 4px' : '0 4px 4px 0',
	}),

	modalOverlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		backdropFilter: 'blur(.1rem)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},

	taskModal: {
		width: 'calc(clamp(18.75rem, 33.019vw + 12.146rem, 62.5rem))',
		background: 'white',
		position: 'relative',
		padding: '1em',
		zIndex: 1001,
		boxShadow:
			'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
	},
});
