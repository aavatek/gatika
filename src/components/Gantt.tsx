import type { Accessor } from 'solid-js';
import {
	onMount,
	createMemo,
	createSignal,
	For,
	Switch,
	Match,
	Show,
	createEffect,
} from 'solid-js';
import { TaskEditForm, tasks, type Task } from '@features/Task';
import { DAY, WEEK } from '@lib/dates';
import { getWeekNumber, Weekdays, Months } from '@lib/dates';
import * as sx from '@stylexjs/stylex';
import { Portal } from 'solid-js/web';
import { Button } from '@components/Form';
import { formatDate, getDate } from '@solid-primitives/date';
import { Heading } from './Layout';
import { projects, type Project } from '@features/Project';
import { notificationMsg, setNotification } from '../features/Notification';

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

	const tasksSorted = createMemo(() => {
		return tasksWithinRange().sort((a, b) => {
			// sort based on when project was created
			const projectA = projects.read(a.project as Project['id'])();
			const projectB = projects.read(b.project as Project['id'])();
			if (projectA?.created !== projectB?.created) {
				return (projectA?.created ?? 0) - (projectB?.created ?? 0);
			}

			// group by project
			if (a.project !== b.project) {
				return (a.project ?? '').localeCompare(b.project ?? '');
			}

			// floating tasks come last
			const aIsFloating = Number.isNaN(a.start) && Number.isNaN(a.end);
			const bIsFloating = Number.isNaN(b.start) && Number.isNaN(b.end);

			if (aIsFloating && !bIsFloating) return 1;
			if (!aIsFloating && bIsFloating) return -1;

			return 0;
		});
	});

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
			const width = wrapper.getBoundingClientRect().width;
			if (width >= 1500) setZoom(56);
			wrapper.scrollLeft =
				((gridAnchorDate() - gridStartDate() - DAY * 2) / DAY) * gridColWidth();
		}
	});

	return (
		<div id="wrapper" onWheel={handleZoom} {...sx.props(style.wrapper)}>
			<Timeline
				cols={gridCols}
				colWidth={gridColWidth}
				zoomModifier={zoom}
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
			/>

			<div {...sx.props(style.gantt(gridCols, gridRows, zoom))}>
				<For each={tasksSorted()} fallback={<div />}>
					{(task, row) => (
						<GanttTask
							task={task}
							row={row}
							colWidth={gridColWidth}
							gridAnchorDate={gridAnchorDate}
							gridStartDate={gridStartDate}
							gridEndDate={gridEndDate}
							tasks={tasksSorted}
							zoom={zoom}
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
	zoom: Accessor<number>;
	tasks: Accessor<Task[]>;
};

const GanttTask = (props: GanttTaskProps) => {
	const [valid, setValid] = createSignal(true);

	const startDate = createMemo(() => {
		if (props.task.start) {
			return props.task.start;
		}

		if (!props.task.start && props.task.end) {
			return props.task.end - WEEK;
		}

		return props.gridAnchorDate();
	});

	const endDate = createMemo(() => {
		if (props.task.end) {
			return props.task.end;
		}

		if (props.task.start && !props.task.end) {
			return props.task.start + WEEK;
		}

		return props.gridAnchorDate() + WEEK;
	});

	const floating = createMemo(() => {
		if (props.task.start && !props.task.end) {
			return 'end';
		}

		if (!props.task.start && props.task.end) {
			return 'start';
		}

		if (!props.task.start && !props.task.end) {
			return 'full';
		}
	});

	const task = createMemo(() => ({
		...props.task,
		start: startDate(),
		end: endDate(),
		floating: floating(),
		valid: valid(),
	}));

	const hasPredecessors = createMemo(() => task().dependencies.length > 0);
	const hasSuccessors = createMemo(
		() =>
			props.tasks().filter((t) => t.dependencies.includes(task().id)).length >
			0,
	);

	const colStart = createMemo(() => {
		return Math.ceil((task().start - props.gridStartDate()) / DAY);
	});

	const colSpan = createMemo(() => {
		return Math.ceil((task().end - task().start) / DAY) + 1;
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
				newEnd >= newStart;

			if (valid) {
				const err = tasks.update(task().id, {
					start: newStart,
					end: newEnd,
				});

				if (err) setValid(false);
				else setValid(true);
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

	const handleCreateConnection = (e: PointerEvent) => {
		e.preventDefault();
		if (e.target === rightConnectorRef) {
			const startX = e.clientX;
			const startY = e.clientY;

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.style.position = 'fixed';
			svg.style.top = '0';
			svg.style.left = '0';
			svg.style.width = '100%';
			svg.style.height = '100%';
			svg.style.pointerEvents = 'none';
			svg.style.zIndex = '1000';

			const line = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'line',
			);
			line.setAttribute('x1', startX.toString());
			line.setAttribute('y1', startY.toString());
			line.setAttribute('x2', startX.toString());
			line.setAttribute('y2', startY.toString());
			line.setAttribute('stroke', 'black');
			line.setAttribute('stroke-width', '2');
			line.setAttribute('stroke-dasharray', '4');

			svg.appendChild(line);
			document.body.appendChild(svg);

			// find all left-side connectors
			const allConnectors = document.querySelectorAll(
				'[data-connector="left"]',
			);

			const connectors = Array.from(allConnectors).filter(
				(connector: Element) => {
					const spanConnector = connector as HTMLSpanElement;
					const connectorID = spanConnector.getAttribute(
						'data-task-id',
					) as Task['id'];
					const connectorTask = tasks.read(connectorID);
					return (
						task().project === connectorTask()?.project &&
						task().id !== connectorTask()?.id &&
						formatDate(getDate(task().end)) <
							formatDate(getDate(connectorTask()?.start || -1)) &&
						!connectorTask()?.dependencies.includes(task().id)
					);
				},
			);

			const handleMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				line.setAttribute('x2', moveEvent.clientX.toString());
				line.setAttribute('y2', moveEvent.clientY.toString());

				// check if we're hovering over any connector
				connectors.forEach((connector) => {
					connector.setAttribute('data-visible', 'true');
					const rect = connector.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;

					// check if cursor is within 15px of connector center
					const distance = Math.hypot(
						moveEvent.clientX - centerX,
						moveEvent.clientY - centerY,
					);

					// add hover effect if close to connector
					if (distance < 15) {
						(connector as HTMLElement).style.background = 'gray';
					} else {
						(connector as HTMLElement).style.background = 'lightgray';
					}
				});
			};

			const handleRelease = (releaseEvent: PointerEvent) => {
				connectors.forEach((connector) => {
					(connector as HTMLElement).style.background = 'lightgray';
					(connector as HTMLElement).removeAttribute('data-visible');

					const rect = connector.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;

					const distance = Math.hypot(
						releaseEvent.clientX - centerX,
						releaseEvent.clientY - centerY,
					);

					if (distance < 15) {
						const targetTaskId = connector.getAttribute(
							'data-task-id',
						) as Task['id'];
						if (targetTaskId) {
							const targetTask = tasks.read(targetTaskId);
							if (targetTask()) {
								const targetDeps = targetTask()?.dependencies || [];
								tasks.update(targetTaskId, {
									dependencies: [...targetDeps, task().id],
								});

								setNotification({
									variant: 'success',
									message: notificationMsg.taskDependencyCreated,
								});
							}
						}
					}
				});

				document.removeEventListener('pointermove', handleMove);
				document.removeEventListener('pointerup', handleRelease);
				svg.remove();
			};

			document.addEventListener('pointermove', handleMove);
			document.addEventListener('pointerup', handleRelease);
		}
	};

	const [modalVisible, setModalVisible] = createSignal(false);
	const handleDoubleClick = (e: MouseEvent) => {
		e.preventDefault();
		setModalVisible(true);
	};

	const updateConnections = () => {
		const successors = props
			.tasks()
			.filter((a) => a.dependencies.includes(task().id));

		if (successors.length === 0) {
			connectionPath.setAttribute('d', '');
			return;
		}

		if (successors.length > 0) {
			const fromRect = rightConnectorRef.getBoundingClientRect();
			const svgRect = connectionWrapper.getBoundingClientRect();
			const startX = fromRect.left + fromRect.width / 2 - svgRect.left;
			const startY = fromRect.top + fromRect.height / 2 - svgRect.top;
			const firstVerticalY = fromRect.bottom - svgRect.top + 18;

			const targetConnectors = successors
				.map((successor) => document.getElementById(`left-${successor.id}`))
				.filter((el) => !!el)
				.map((connector) => {
					const bounds = connector.getBoundingClientRect();
					return {
						x: bounds.left + bounds.width / 2 - svgRect.left,
						y: bounds.top + bounds.height / 2 - svgRect.top,
					};
				})
				.sort((a, b) => a.x - b.x);

			if (targetConnectors.length > 0) {
				let pathD = `M ${startX} ${startY} 
                        V ${firstVerticalY}
                        H ${targetConnectors[0].x}
                        V ${targetConnectors[0].y}`;

				for (let i = 1; i < targetConnectors.length; i++) {
					pathD += ` V ${targetConnectors[i].y}
                          H ${targetConnectors[i].x}`;
				}

				connectionPath.setAttribute('d', pathD);
			}
		}
	};

	let leftConnectorRef!: HTMLSpanElement;
	let rightConnectorRef!: HTMLSpanElement;
	let connectionWrapper!: SVGSVGElement;
	let connectionPath!: SVGPathElement;

	onMount(() => {
		leftConnectorRef.id = `left-${task().id}`;
		rightConnectorRef.id = `right-${task().id}`;
		setTimeout(updateConnections, 0);
	});

	createEffect(() => {
		const targetActivities = props
			.tasks()
			.filter((a) => a.dependencies.includes(task().id))
			.map((a) => [a.start, a.end]);

		// update when any of these changes
		const _ = [targetActivities, task(), props.zoom()];
		requestAnimationFrame(updateConnections);
	});

	const leftConnectorVisible = createMemo(() => {
		return hasPredecessors();
	});

	const rightConnectorVisible = createMemo(() => {
		return hasSuccessors();
	});

	return (
		<div {...sx.props(style.taskWrapper(props.row, colStart, colSpan, task))}>
			<span
				ref={leftConnectorRef}
				{...sx.props(
					style.taskConnector(
						'left',
						leftConnectorVisible,
						rightConnectorVisible,
					),
				)}
				onPointerDown={handleCreateConnection}
				data-connector="left"
				data-task-id={task().id}
			/>
			<span
				{...sx.props(style.taskHandle('left', task))}
				onPointerDown={handleDrag('left')}
			/>
			<span
				{...sx.props(style.task(task))}
				onPointerDown={handleDrag('move')}
				onDblClick={handleDoubleClick}
			>
				{props.task.name}
			</span>
			<span
				{...sx.props(style.taskHandle('right', task))}
				onPointerDown={handleDrag('right')}
				data-task-id={task().id}
			/>
			<span
				ref={rightConnectorRef}
				{...sx.props(
					style.taskConnector(
						'right',
						leftConnectorVisible,
						rightConnectorVisible,
					),
				)}
				data-connector="right"
				data-task-id={task().id}
				onPointerDown={handleCreateConnection}
			/>
			<svg ref={connectionWrapper} {...sx.props(style.connectorLine)}>
				<title>Connector Line</title>
				<path
					ref={connectionPath}
					stroke="black"
					fill="none"
					stroke-width={2}
				/>
			</svg>

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

	const handleOverlayClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			props.handleClose();
		}
	};

	return (
		<Show when={task()}>
			{(task) => (
				<Portal>
					<div {...sx.props(style.modalOverlay)} onClick={handleOverlayClick}>
						<section {...sx.props(style.taskModal)}>
							<header {...sx.props(style.modalHeader)}>
								<Heading content={task().name} level="h2" />
								<Button
									variant="link"
									type="button"
									label="Sulje"
									onClick={props.handleClose}
								/>
							</header>
							<TaskEditForm task={task} />
						</section>
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
					<div {...sx.props(style.months(month))}>{Months[month.num]}</div>
				)}
			</For>
			<Switch>
				<Match when={props.zoomModifier() >= 45}>
					<For each={tl().days}>
						{(day, index) => (
							<div {...sx.props(style.days(index, day.isToday))}>
								<span>{day.dayOfMonth}</span>
								<span>{Weekdays[day.dayOfWeek]}</span>
							</div>
						)}
					</For>
				</Match>
				<Match when={props.zoomModifier() < 45}>
					<For each={tl().weeks}>
						{(week) => (
							<div {...sx.props(style.weeks(week))}>Viikko {week.label}</div>
						)}
					</For>
				</Match>
			</Switch>
		</div>
	);
};

const style = sx.create({
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
		background: isToday ? '#d0d0d0' : 'white',
		textWrap: 'nowrap',
		overflow: 'hidden',
	}),

	weeks: (week) => ({
		height: '3rem',
		gridColumn: `${week.startColumn} / span ${week.days}`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textWrap: 'nowrap',
		overflow: 'hidden',
		background: week.isThisWeek ? '#d0d0d0' : 'white',
	}),

	months: (month) => ({
		height: '3rem',
		gridColumn: `${month.startColumn} / span ${month.days}`,
		border: '1px solid gray',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'white',
		textWrap: 'nowrap',
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

	taskConnector: (
		side,
		leftConnectorVisible: Accessor<boolean>,
		rightConnectorVisible: Accessor<boolean>,
	) => ({
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		width: '12px',
		height: '12px',
		borderRadius: '50%',
		background: 'lightgray',
		alignSelf: 'center',
		left: side === 'left' ? '-.85rem' : 'initial',
		right: side === 'right' ? '-.85rem' : 'initial',
		zIndex: 1,
		opacity:
			side === 'right' ? +rightConnectorVisible() : +leftConnectorVisible(),
		':is([data-visible])': {
			opacity: 1,
		},
		':is([data-connector="right"]):hover': {
			opacity: 1,
			cursor: 'pointer',
		},
		':is([data-connector="right"]):active': {
			opacity: 1,
			cursor: 'pointer',
		},
	}),

	connectorLine: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		overflow: 'visible',
	},

	taskWrapper: (row, colStart, colSpan, current) => ({
		gridRow: row() + 1,
		gridColumn: `${colStart()} / span ${colSpan()}`,
		position: 'relative',
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		alignContent: 'stretch',
		justifyItems: 'stretch',
		maskImage:
			current().floating === 'start'
				? 'linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 1))'
				: current().floating === 'end'
					? 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.4))'
					: 'none',
		':hover': {
			maskImage: 'none',
		},
	}),

	task: (current) => ({
		background:
			current().floating === 'full'
				? '#e0e0e0'
				: current().valid
					? 'white'
					: '#ffebee',
		border: `2px ${current().floating ? 'dashed' : 'solid'} ${current().valid ? '#666' : '#b71c1c'}`,
		borderLeft: 'none',
		borderRight: 'none',
		cursor: 'pointer',
		textWrap: 'nowrap',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: '1',
	}),

	taskHandle: (side, current) => ({
		width: '.5rem',
		cursor: 'ew-resize',
		backgroundColor: `${current().valid ? '#666' : '#b71c1c'}`,
		borderRadius: side === 'left' ? '4px 0 0 4px' : '0 4px 4px 0',
		zIndex: 1,
	}),

	modalOverlay: {
		top: 0,
		position: 'fixed',
		width: '100vw',
		height: '100vh',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		backdropFilter: 'blur(.1rem)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2,
	},

	taskModal: {
		width: 'calc(clamp(18.75rem, 33.019vw + 12.146rem, 62.5rem))',
		background: 'white',
		position: 'relative',
		padding: '2rem 1.5rem',
		border: '3px solid black',
		zIndex: 2,
	},

	modalHeader: {
		display: 'flex',
		gap: '1rem',
		alignItems: 'end',
		justifyContent: 'space-between',
		marginBottom: '1rem',
	},

	modalHeading: {
		fontSize: '1.5rem',
		lineHeight: '1.5rem',
	},

	modalCloseButton: {
		padding: 0,
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		fontSize: '1.15rem',
	},
});
