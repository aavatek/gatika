import {
	onMount,
	onCleanup,
	createMemo,
	createSignal,
	createEffect,
} from 'solid-js';
import { For, Switch, Match, Show } from 'solid-js';
import { TaskEditForm, tasks, type Task } from '@features/Task';
import { DAY, WEEK, MONTH } from '@lib/dates';
import { Weekdays, Months } from '@lib/dates';
import { getDateDiff, getMonth, getWeek, normalizeDate } from '@lib/dates';
import * as sx from '@stylexjs/stylex';
import { Portal } from 'solid-js/web';
import { Button } from '@components/Form';
import { formatDate, getDate } from '@solid-primitives/date';
import { Heading } from '@components/Layout';
import { notificationMsg, setNotification } from '../features/Notification';
import {
	ProjectColors,
	projects,
	type Project,
	type ColorKey,
} from '@features/Project';

const isFloating = (task: Task) => {
	return Number.isNaN(task.start) && Number.isNaN(task.end);
};

export const Gantt = (props: { tasks: Task[] }) => {
	// zoom sets the width of a day in pixels
	const [zoom, setZoom] = createSignal(45);

	const gridStartDate = normalizeDate(Date.now() - MONTH * 2);
	const gridEndDate = normalizeDate(Date.now() + MONTH * 2);
	const gridAnchorDate = normalizeDate(Date.now() - WEEK);

	// filter tasks in range of timeline
	const tasksInRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate)
			.filter((task) => !task.end || task.end < gridEndDate + DAY),
	);

	// calculate grid rows and columns
	const rows = createMemo(() => Math.max(15, tasksInRange.length));
	const cols = createMemo(() => getDateDiff(gridStartDate, gridEndDate));

	const tasksSorted = createMemo(() => {
		return tasksInRange().sort((a, b) => {
			const A = projects.read(a.project as Project['id']);
			const B = projects.read(b.project as Project['id']);

			// sort based on when project was created
			if (A && B) return A.created - B.created;

			// group activities by project
			if (A && B) return A.id.localeCompare(B.id);

			// floating tasks come last
			if (isFloating(a) && !isFloating(b)) return 1;
			if (!isFloating(a) && isFloating(b)) return -1;

			return 0;
		});
	});

	// event handlers & cleanup
	const ref = (el: HTMLDivElement) => {
		const handleZoom = (ev: WheelEvent) => {
			if (ev.ctrlKey) {
				ev.preventDefault();

				const MIN = 20;
				const MAX = 168;
				const SENSITIVITY = 0.001;

				const offset = ev.clientX - el.getBoundingClientRect().left;
				const change = zoom() * Math.exp(-ev.deltaY * SENSITIVITY);

				const newZoom = Math.max(MIN, Math.min(MAX, Math.round(change)));
				const newWidth = cols() * newZoom;
				const newRatio = (el.scrollLeft + offset) / (cols() * zoom());
				const newScroll = Math.round(newRatio * newWidth - offset);

				setZoom(newZoom);
				el.scrollLeft = newScroll;
			}
		};

		onMount(() => {
			el.addEventListener('wheel', handleZoom);
			el.scrollLeft = ((gridAnchorDate - gridStartDate) / DAY) * zoom();
			onCleanup(() => el.removeEventListener('wheel', handleZoom));
		});
	};

	return (
		<div ref={ref} {...sx.attrs(style.wrapper)}>
			<TimelineHeader
				cols={cols()}
				zoom={zoom()}
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
			/>

			<div {...sx.attrs(style.gantt(cols(), rows(), zoom()))}>
				<For each={tasksSorted()} fallback={<div />}>
					{(task, index) => (
						<GanttTask
							task={task}
							index={index()}
							gridAnchorDate={gridAnchorDate}
							gridStartDate={gridStartDate}
							gridEndDate={gridEndDate}
							tasks={tasksSorted()}
							zoom={zoom()}
						/>
					)}
				</For>
			</div>
		</div>
	);
};

type GanttTaskProps = {
	index: number;
	task: Task;
	gridStartDate: number;
	gridEndDate: number;
	gridAnchorDate: number;
	zoom: number;
	tasks: Task[];
};

const GanttTask = (props: GanttTaskProps) => {
	const [valid, setValid] = createSignal(true);

	// set placeholder dates for floating tasks
	const getEffectiveDates = createMemo(() => ({
		start: props.task.start
			? props.task.start
			: props.task.end
				? props.task.end - WEEK
				: props.gridAnchorDate,

		end: props.task.end
			? props.task.end
			: props.task.start
				? props.task.start + WEEK
				: props.gridAnchorDate + WEEK,
	}));

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

	const projectColor = createMemo(() => {
		const projectId = props.task.project as Project['id'];
		const project = projects.read(projectId);

		return project?.color;
	});

	const task = createMemo(() => ({
		...props.task,
		...getEffectiveDates(),
		floating: floating(),
		valid: valid(),
		color: projectColor(),
	}));

	const row = createMemo(() => props.index + 1);
	const col = createMemo(() => ({
		start: getDateDiff(props.gridStartDate, task().start),
		span: getDateDiff(task().end, task().start),
	}));

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

					if (connectorTask) {
						return (
							task().project === connectorTask.project &&
							task().id !== connectorTask.id &&
							props.task.start &&
							props.task.end &&
							formatDate(getDate(task().end)) <
								formatDate(getDate(connectorTask.start || -1)) &&
							!connectorTask.dependencies.includes(task().id)
						);
					}
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
						(connector as HTMLElement).style.background = '#888599';
					} else {
						(connector as HTMLElement).style.background = '#CBC9D9';
					}
				});
			};

			const handleRelease = (releaseEvent: PointerEvent) => {
				connectors.forEach((connector) => {
					(connector as HTMLElement).style.background = '#B5B2C4';
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
							if (targetTask) {
								const targetDeps = targetTask.dependencies || [];
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

	const updateConnections = () => {
		const successors = props.tasks.filter((a) =>
			a.dependencies.includes(task().id),
		);

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
		setTimeout(updateConnections, 0);
	});

	const offset = (dx: number) => Math.round(dx / props.zoom) * DAY;
	const updatePosition = (start: number, end: number) => {
		const validStart = start >= props.gridStartDate;
		const validEnd = end >= start && end <= props.gridEndDate;

		if (validStart && validEnd) {
			const error = tasks.update(task().id, { start, end });
			if (error) setValid(false);
		}
	};

	const [modalVisible, setModalVisible] = createSignal(false);
	const ref = (role: 'left' | 'center' | 'right') => (el: HTMLSpanElement) => {
		const handleDrag = (ev: PointerEvent) => {
			ev.preventDefault();

			const { clientX } = ev;
			const { start, end } = task();

			const handleMove = (ev: PointerEvent) => {
				const dx = ev.clientX - clientX;

				switch (role) {
					case 'left':
						return updatePosition(start + offset(dx), end);
					case 'center':
						return updatePosition(start + offset(dx), end + offset(dx));
					case 'right':
						return updatePosition(start, end + offset(dx));
				}
			};

			const handleCleanup = () => {
				setValid(true);
				document.removeEventListener('pointermove', handleMove);
				document.removeEventListener('pointerup', handleCleanup);
			};

			document.addEventListener('pointermove', handleMove);
			document.addEventListener('pointerup', handleCleanup);
		};

		const handleDblClick = () => {
			setModalVisible(true);
		};

		onMount(() => {
			el.addEventListener('pointerdown', handleDrag);
			el.addEventListener('dblclick', handleDblClick);

			onCleanup(() => {
				el.removeEventListener('pointerdown', handleDrag);
				el.removeEventListener('dblclick', handleDblClick);
			});
		});
	};

	createEffect(() => {
		const targetActivities = props.tasks
			.filter((a) => a.dependencies.includes(task().id))
			.map((a) => [a.start, a.end]);

		// update when any of these changes
		const _ = [targetActivities, task(), props.zoom];
		requestAnimationFrame(updateConnections);
	});

	return (
		<div {...sx.attrs(style.taskWrapper(row(), col()))}>
			<span
				ref={leftConnectorRef}
				{...sx.attrs(style.taskConnector('left'))}
				onPointerDown={handleCreateConnection}
				data-connector="left"
				data-task-id={task().id}
				id={`left-${task().id}`}
			/>

			<span ref={ref('left')} {...sx.attrs(style.taskHandle('left'))} />

			<span ref={ref('center')} {...sx.attrs(style.task(task))}>
				{props.task.name}
			</span>

			<span ref={ref('right')} {...sx.attrs(style.taskHandle('right'))} />

			<span
				ref={rightConnectorRef}
				{...sx.attrs(style.taskConnector('right'))}
				data-connector="right"
				data-task-id={task().id}
				onPointerDown={handleCreateConnection}
				id={`right-${task().id}`}
			/>

			<svg ref={connectionWrapper} {...sx.attrs(style.connectorLine)}>
				<title>Connector Line</title>
				<path
					ref={connectionPath}
					stroke="rgba(0,0,0,0.7)"
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
		<Show when={task}>
			{(task) => (
				<Portal>
					<div {...sx.attrs(style.modalOverlay)} onClick={handleOverlayClick}>
						<section {...sx.attrs(style.taskModal)}>
							<header {...sx.attrs(style.modalHeader)}>
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

type TimelineHeaderProps = {
	cols: number;
	zoom: number;
	gridStartDate: number;
	gridEndDate: number;
};

const TimelineHeader = (props: TimelineHeaderProps) => {
	const timeline = createMemo(() => {
		const days = Array.from(
			{ length: props.cols },
			(_, i) => props.gridStartDate + i * DAY,
		);

		const months = [...new Set(days.map(getMonth))].map((month) => ({
			month,
			start: days.findIndex((d) => getMonth(d) === month) + 1,
			span: days.filter((d) => getMonth(d) === month).length,
		}));

		const weeks = [...new Set(days.map(getWeek))].map((week) => ({
			week,
			start: days.findIndex((d) => getWeek(d) === week) + 1,
			span: days.filter((d) => getWeek(d) === week).length,
		}));

		return { days, months, weeks };
	});

	return (
		<div {...sx.attrs(style.ganttHeader(props.cols, props.zoom))}>
			<For each={timeline().months}>
				{({ month, start, span }) => (
					<div {...sx.attrs(style.ganttHeaderLabel(1, { start, span }))}>
						<span>{Months[month]}</span>
					</div>
				)}
			</For>

			<Switch>
				<Match when={props.zoom < 45}>
					<For each={timeline().weeks}>
						{({ week, start, span }) => (
							<div {...sx.attrs(style.ganttHeaderLabel(2, { start, span }))}>
								<Show when={span >= 4}>
									<span>Week {week}</span>
								</Show>
							</div>
						)}
					</For>
				</Match>

				<Match when={props.zoom >= 45}>
					<For each={timeline().days}>
						{(day, i) => (
							<div
								{...sx.attrs(
									style.ganttHeaderLabel(2, { start: i() + 1, span: 1 }),
								)}
							>
								<span>{new Date(day).getDate()}</span>
								<span>
									{Weekdays[new Date(day).getDay()].slice(0, 3).toUpperCase()}
								</span>
							</div>
						)}
					</For>
				</Match>
			</Switch>
		</div>
	);
};

const style = sx.create({
	wrapper: {
		overflowX: 'auto',
		background: '#FCFBFD',
		boxShadow: `
		    inset 0 2px 4px -2px rgba(50, 50, 93, 0.25),
		    inset 0 -2px 4px -2px rgba(50, 50, 93, 0.25),
		    inset 2px 0 4px -2px rgba(50, 50, 93, 0.25),
		    inset -2px 0 4px -2px rgba(50, 50, 93, 0.25)
		  `,
		borderRadius: '4px',
		border: '1px solid rgba(0, 0, 0, 0.1)',
	},

	gantt: (cols: number, rows: number, zoom: number) => ({
		display: 'grid',
		rowGap: '0.75rem',
		gridTemplateColumns: `repeat(${cols}, 1fr)`,
		gridTemplateRows: `repeat(${rows}, 2rem)`,
		width: `${cols * zoom}px`,
		minHeight: `${rows * 3}rem`,
		paddingTop: '1rem',
		paddingBottom: '1rem',
		backgroundSize: `${100 / cols}%`,
		backgroundImage:
			'linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
	}),

	taskConnector: (side: 'left' | 'right') => ({
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		width: '12px',
		height: '12px',
		borderRadius: '50%',
		background: '#B5B2C4',
		alignSelf: 'center',
		left: side === 'left' ? '-.85rem' : 'initial',
		right: side === 'right' ? '-.85rem' : 'initial',
		zIndex: 1,
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

	taskWrapper: (row: number, col: { start: number; span: number }) => ({
		gridRow: row,
		gridColumn: `${col.start} / span ${col.span}`,
		position: 'relative',
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		alignContent: 'stretch',
		justifyItems: 'stretch',
		borderRadius: '0.25rem',
		boxShadow:
			'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
	}),

	task: (current) => ({
		background:
			current().floating === 'start'
				? `linear-gradient(to right, ${
						current().valid
							? `lch(from ${ProjectColors[current().color as ColorKey]} l c h / 0.25)`
							: '#ffebee'
					} 20%, ${current().valid ? ProjectColors[current().color as ColorKey] : '#ffebee'})`
				: current().floating === 'end'
					? `linear-gradient(to right, ${
							current().valid
								? ProjectColors[current().color as ColorKey]
								: '#ffebee'
						}, ${
							current().valid
								? `lch(from ${ProjectColors[current().color as ColorKey]} l c h / 0.25)`
								: '#ffebee'
						} 100%)`
					: current().floating === 'full'
						? current().valid
							? `lch(from ${ProjectColors[current().color as ColorKey]} l c h / 0.25)`
							: '#ffebee'
						: current().valid
							? ProjectColors[current().color as ColorKey]
							: '#ffebee',
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

	taskHandle: (side: 'left' | 'right') => ({
		width: '6px',
		cursor: 'ew-resize',
		zIndex: 1,
		background: 'rgba(0,0,0,0.7)',
		borderRadius: side === 'right' ? '0 .25rem .25rem 0' : '.25rem 0 0 .25rem',
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

	ganttHeader: (cols: number, zoom: number) => ({
		display: 'grid',
		gap: 1,
		gridTemplateRows: 'repeat(2, 3rem)',
		gridTemplateColumns: `repeat(${cols}, 1fr)`,
		width: `${cols * zoom}px`,
		paddingLeft: 1,
		paddingBottom: 1,
		background: 'gray',
	}),

	ganttHeaderLabel: (row: number, col: { start: number; span: number }) => ({
		background: 'white',
		textWrap: 'nowrap',
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gridRow: row,
		gridColumn: `${col.start} / span ${col.span}`,
	}),
});
