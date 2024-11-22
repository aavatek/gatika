import {
	onMount,
	onCleanup,
	createMemo,
	createSignal,
	createEffect,
} from 'solid-js';
import { For, Switch, Match, Show } from 'solid-js';
import {
	TaskEditForm,
	tasks,
	taskStore,
	isFloating,
	type Task,
} from '@features/Task';
import { DAY, WEEK, MONTH } from '@lib/dates';
import { Weekdays, Months } from '@lib/dates';
import { getDateDiff, getMonth, getWeek, normalizeDate } from '@lib/dates';
import * as sx from '@stylexjs/stylex';
import { Portal } from 'solid-js/web';
import { Button } from '@components/Form';
import { Heading } from '@components/Layout';
import { notificationMsg, setNotification } from '../features/Notification';
import {
	ProjectColors,
	projects,
	type Project,
	type ColorKey,
} from '@features/Project';
import { handleHistory, redo, undo } from '../lib/history';

export const Gantt = (props: { tasks: Task[] }) => {
	const gridStartDate = normalizeDate(Date.now() - MONTH * 2);
	const gridEndDate = normalizeDate(Date.now() + MONTH * 2);
	const gridAnchorDate = normalizeDate(Date.now() - WEEK);

	// zoom sets the width of a day in pixels
	const [zoom, setZoom] = createSignal(45);

	// filter tasks that fall between gridStartDate & gridEndDate
	const tasksInRange = createMemo(() =>
		props.tasks
			.filter((task) => !task.start || task.start > gridStartDate)
			.filter((task) => !task.end || task.end < gridEndDate + DAY),
	);

	// calculate grid rows and columns
	const rows = createMemo(() => Math.max(15, tasksInRange.length));
	const cols = createMemo(() => getDateDiff(gridStartDate, gridEndDate));

	// sort tasks
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

	// handle zoom and scroll to position
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
			<GanttHeader
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
	const [editing, setEditing] = createSignal(false);

	// get floating status
	const floating = createMemo(() => {
		if (props.task.start && !props.task.end) return 'end';
		if (!props.task.start && props.task.end) return 'start';
		if (!props.task.start && !props.task.end) return 'full';
	});

	// assign placeholder dates for floating tasks
	const getEffectiveDates = createMemo(() => ({
		start: props.task.start
			? props.task.start
			: props.task.end
				? props.task.end - WEEK
				: props.gridAnchorDate + DAY,

		end: props.task.end
			? props.task.end
			: props.task.start
				? props.task.start + WEEK - DAY
				: props.gridAnchorDate + WEEK,
	}));

	const project = createMemo(() => {
		const projectId = props.task.project as Project['id'];
		return projects.read(projectId);
	});

	const task = createMemo(() => ({
		...props.task,
		...getEffectiveDates(),
		floating: floating(),
		valid: valid(),
		color: project()?.color || 'Coral',
	}));

	// calculate grid position
	const row = createMemo(() => props.index + 1);
	const col = createMemo(() => ({
		start: getDateDiff(props.gridStartDate, task().start),
		span: getDateDiff(task().end, task().start),
	}));

	// task actions (moving, resizing, editing)
	const ref = (role: 'left' | 'center' | 'right') => (el: HTMLSpanElement) => {
		const offset = (dx: number) => Math.round(dx / props.zoom) * DAY;
		const updatePosition = (start: number, end: number) => {
			const validStart = start >= props.gridStartDate;
			const validEnd = end >= start && end <= props.gridEndDate;

			if (validStart && validEnd) {
				const error = tasks.update(task().id, { start, end });
				if (error) setValid(false);
			}
		};

		const handleDrag = (ev: PointerEvent) => {
			ev.preventDefault();
			const { clientX } = ev;
			const { start, end } = task();

			// save original state to history
			handleHistory([...taskStore]);

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

		onMount(() => {
			el.addEventListener('pointerdown', handleDrag);
			el.addEventListener('dblclick', () => setEditing(true));

			onCleanup(() => {
				el.removeEventListener('pointerdown', handleDrag);
				el.removeEventListener('dblclick', () => setEditing(true));
			});
		});
	};

	// connection creation logic
	const connector = (side: 'left' | 'right') => (el: HTMLSpanElement) => {
		el.setAttribute('data-side', side);
		el.id = `${side}#${task().id}`;

		const hasPredecessors = createMemo(() => {
			return task().dependencies.length > 0;
		});

		const hasSuccessors = createMemo(() => {
			return props.tasks.some((t) => t.dependencies.includes(task().id));
		});

		// mark targets
		createEffect(() => {
			switch (true) {
				case side === 'left' && hasPredecessors():
				case side === 'right' && hasSuccessors():
					return el.setAttribute('data-target', 'true');
				default:
					el.removeAttribute('data-target');
			}
		});

		if (side === 'right') {
			const handleConnect = (ev: PointerEvent) => {
				ev.preventDefault();

				// helper to calculate mouse position in relation to element
				const getDistance = (ev: PointerEvent, el: Element) => {
					const rect = el.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;
					const disX = ev.clientX - centerX;
					const disY = ev.clientY - centerY;
					return Math.hypot(disX, disY);
				};

				// save original position
				const { clientX: startX, clientY: startY } = ev;

				const Line = (
					<line
						x1={startX}
						y1={startY}
						x2={startX}
						y2={startY}
						stroke="black"
						stroke-width="2"
						stroke-dasharray="4"
					/>
				) as SVGLineElement;

				const SVGwrapper = (
					<svg>
						<title>Connection Line</title>
						{Line}
					</svg>
				) as SVGSVGElement;

				// assign styles to wrapper
				Object.assign(SVGwrapper.style, {
					position: 'fixed',
					top: '0',
					left: '0',
					width: '100%',
					height: '100%',
					zIndex: 2,
					pointerEvents: 'none',
				});

				document.body.appendChild(SVGwrapper);

				// find valid targets
				const all = Array.from(document.querySelectorAll('[data-side="left"]'));
				const validTargets = all.filter((connector: Element) => {
					const targetID = connector.id.split('#')[1] as Task['id'];
					const target = tasks.read(targetID);
					const current = task();

					if (target) {
						return (
							// must not target self
							current.id !== target.id &&
							// must share project
							current.project === target.project &&
							// must not break constraints
							current.end < target.start &&
							// must be a unique connection
							!target.dependencies.includes(task().id)
						);
					}
				});

				// mark possible targets
				validTargets.forEach((connector) => {
					connector.setAttribute('data-possible-target', 'true');
				});

				// update line as mouse moves
				const handleMove = (ev: PointerEvent) => {
					Line.setAttribute('x2', ev.clientX.toString());
					Line.setAttribute('y2', ev.clientY.toString());
				};

				const handleRelease = (ev: PointerEvent) => {
					validTargets.forEach((connector) => {
						// create connection if hovering connector during release
						if (getDistance(ev, connector) < 15) {
							const targetID = connector.id.split('#')[1] as Task['id'];
							const target = tasks.read(targetID);

							if (target) {
								tasks.update(target.id, {
									dependencies: [...target.dependencies, task().id],
								});

								setNotification({
									variant: 'success',
									message: notificationMsg.taskDependencyCreated,
								});
							}
						}

						// unmark possible targets
						validTargets.forEach((connector) => {
							connector.removeAttribute('data-possible-target');
						});
					});

					document.removeEventListener('pointermove', handleMove);
					document.removeEventListener('pointerup', handleRelease);
					SVGwrapper.remove();
				};

				document.addEventListener('pointermove', handleMove);
				document.addEventListener('pointerup', handleRelease);
			};

			el.addEventListener('pointerdown', handleConnect);
			onCleanup(() => el.removeEventListener('pointerdown', handleConnect));
		}
	};

	const successors = createMemo(() =>
		props.tasks.filter((t) => t.dependencies.includes(task().id)),
	);

	// handle connection visualization logic
	const connection = (el: SVGPathElement) => {
		const svg = el.closest('svg');

		if (svg) {
			createEffect(() => {
				const svgRect = svg.getBoundingClientRect();
				const right = document.getElementById(`right#${task().id}`);

				if (right) {
					const paths = successors()
						.map((successor) => {
							const rightRect = right.getBoundingClientRect();
							const left = document.getElementById(`left#${successor.id}`);

							if (left) {
								const leftRect = left.getBoundingClientRect();
								const x1 = rightRect.left + rightRect.width / 2 - svgRect.left;
								const y1 = rightRect.top + rightRect.height / 2 - svgRect.top;
								const x2 = leftRect.left + leftRect.width / 2 - svgRect.left;
								const y2 = leftRect.top + leftRect.height / 2 - svgRect.top;

								const nextTaskTop =
									document
										.getElementById(`right#${props.tasks[props.index + 1]?.id}`)
										?.getBoundingClientRect().top ?? rightRect.bottom + 32;
								const vy1 = (rightRect.bottom + nextTaskTop) / 2 - svgRect.top;

								const firstSuccessor = props.tasks.find((t) =>
									t.dependencies.includes(task().id),
								);

								const firstSuccessorLeft = document.getElementById(
									`left#${firstSuccessor?.id}`,
								);
								const targetX = firstSuccessorLeft
									? firstSuccessorLeft.getBoundingClientRect().left +
										firstSuccessorLeft.getBoundingClientRect().width / 2 -
										svgRect.left
									: x2;

								return `M ${x1} ${y1} V ${vy1} H ${targetX} V ${y2} H ${x2}`;
							}
						})
						.join(' ');

					// force rerender if any props change
					({ ...props });

					requestAnimationFrame(() => el.setAttribute('d', paths));
				}
			});
		}
	};

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				undo();
			}

			if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				redo();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		onCleanup(() => window.removeEventListener('keydown', handleKeydown));
	});

	return (
		<div {...sx.attrs(style.taskWrapper(row(), col()))}>
			<span ref={connector('left')} {...sx.attrs(style.connector(true))} />
			<span ref={ref('left')} {...sx.attrs(style.taskHandle('left'))} />
			<span ref={ref('center')} {...sx.attrs(style.task(task))}>
				{task().name}
			</span>
			<span ref={ref('right')} {...sx.attrs(style.taskHandle('right'))} />
			<span ref={connector('right')} {...sx.attrs(style.connector(false))} />

			<svg {...sx.attrs(style.connectorLine)}>
				<title>Connector Line</title>
				<path
					ref={connection}
					stroke="rgba(0,0,0,0.7)"
					fill="none"
					stroke-width={2}
				/>
			</svg>

			<Show when={editing()}>
				<TaskModal id={task().id} handleClose={() => setEditing(false)} />
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

type GanttHeaderProps = {
	cols: number;
	zoom: number;
	gridStartDate: number;
	gridEndDate: number;
};

const GanttHeader = (props: GanttHeaderProps) => {
	const labels = createMemo(() => {
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
			<For each={labels().months}>
				{({ month, start, span }) => (
					<div {...sx.attrs(style.hLabel(1, { start, span }))}>
						<span>{Months[month]}</span>
					</div>
				)}
			</For>

			<Switch>
				<Match when={props.zoom < 45}>
					<For each={labels().weeks}>
						{({ week, start, span }) => (
							<div {...sx.attrs(style.hLabel(2, { start, span }))}>
								<Show when={span >= 4}>
									<span>Viikko {week}</span>
								</Show>
							</div>
						)}
					</For>
				</Match>

				<Match when={props.zoom >= 45}>
					<For each={labels().days}>
						{(day, i) => (
							<div {...sx.attrs(style.hLabel(2, { start: i() + 1, span: 1 }))}>
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

		// optimize rendering
		willChange: 'transform',
		transform: 'translateZ(0)',
		backfaceVisibility: 'hidden',
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
		columnGap: 1,
		paddingLeft: 1,
		backgroundSize: `${100 / cols}%`,
		backgroundImage:
			'linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px)',

		// optimize rendering
		willChange: 'transform',
		transform: 'translateZ(0)',
		backfaceVisibility: 'hidden',
	}),

	connector: (isTarget: boolean) => ({
		position: 'absolute',
		width: '12px',
		height: '12px',
		borderRadius: '50%',
		background: '#B5B2C4',
		alignSelf: 'center',
		left: isTarget ? '-.85rem' : 'initial',
		right: !isTarget ? '-.85rem' : 'initial',
		zIndex: 1,
		cursor: isTarget ? 'initial' : 'pointer',

		// not data targets
		':not([data-target], [data-possible-target])': {
			opacity: 0,

			// hover right connector only
			':hover': {
				opacity: isTarget ? 0 : 1,
			},

			// keep effect while dragging
			':active': {
				opacity: isTarget ? 0 : 1,
			},
		},

		// current targets
		':is([data-target])': {
			opacity: 1,
		},

		// possible target (while creating connection)
		':is([data-possible-target])': {
			opacity: 1,
			':hover': {
				filter: 'brightness(0.75)',
			},
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
							: 'lch(82% 80 25)'
					} 20%, ${current().valid ? ProjectColors[current().color as ColorKey] : '#ffebee'})`
				: current().floating === 'end'
					? `linear-gradient(to right, ${
							current().valid
								? ProjectColors[current().color as ColorKey]
								: 'lch(82% 80 25)'
						}, ${
							current().valid
								? `lch(from ${ProjectColors[current().color as ColorKey]} l c h / 0.25)`
								: 'lch(82% 80 25)'
						} 100%)`
					: current().floating === 'full'
						? current().valid
							? `lch(from ${ProjectColors[current().color as ColorKey]} l c h / 0.25)`
							: 'lch(82% 80 25)'
						: current().valid
							? ProjectColors[current().color as ColorKey]
							: 'lch(82% 80 25)',
		borderLeft: 'none',
		borderRight: 'none',
		cursor: 'pointer',
		textWrap: 'nowrap',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
		color: 'rgba(0,0,0,0.75)',
		fontWeight: 'bold',
		fontSize: '0.9rem',
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
		zIndex: 2,
		boxShadow:
			'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
		border: '1px solid rgba(0, 0, 0, 0.25)',
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
		background: 'rgba(0,0,0,0.15)',
		boxShadow:
			'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',

		// optimize rendering
		willChange: 'transform',
		transform: 'translateZ(0)',
		backfaceVisibility: 'hidden',
	}),

	hLabel: (row: number, col: { start: number; span: number }) => ({
		background: 'white',
		textWrap: 'nowrap',
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gridRow: row,
		gridColumn: `${col.start} / span ${col.span}`,
		color: 'rgba(0,0,0,0.75)',
		fontWeight: 'bold',
		fontSize: '0.9rem',

		// optimize rendering
		willChange: 'transform',
		transform: 'translateZ(0)',
		backfaceVisibility: 'hidden',
	}),
});
