import type { Accessor, JSX } from 'solid-js';
import { For, Show, children, createMemo, splitProps } from 'solid-js';
import { getDate, formatDate, DAY } from '@solid-primitives/date';
import * as mf from '@modular-forms/solid';
import * as v from 'valibot';
import * as sx from '@stylexjs/stylex';
import { Button, InputField, SelectField } from '@components/Form';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { createStore, produce } from 'solid-js/store';
import { projects, type Project } from '@features/Project';
import { Heading } from '@components/Layout';
import { List, ListItem } from '@features/List';
import { notificationMsg, setNotification } from '@features/Notification';
import { normalizeDate } from '@lib/dates';

// -------------------------------------------------------------------------------------

export const isFloating = (task: Task) => {
	return Number.isNaN(task.start) && Number.isNaN(task.end);
};

export const [taskStore, setTaskStore] = makePersisted(
	createStore<Task[]>([]),
	{
		name: 'tasks',
		storage: localStorage,
		sync: storageSync,
	},
);

export const tasks = {
	create: (task: Task) => {
		setTaskStore(
			produce((store) => {
				store.push(task);
			}),
		);
	},

	update: (
		id: Task['id'],
		data: Partial<Task>,
		updatePredecessors = true,
		updateSuccessors = true,
	) => {
		const currentTask = taskStore.find((task) => task.id === id);
		if (!currentTask) return new Error('Task not found');

		const predecessorsSorted = taskStore
			.filter((task) => currentTask.dependencies.includes(task.id))
			.filter((task) => task.end)
			.sort((a, b) => (b.end as number) - (a.end as number));

		if (predecessorsSorted.length > 0) {
			const firstPossibleStart = predecessorsSorted[0].end as number;
			if (data.start && data.start <= firstPossibleStart)
				return new Error(err.date.dependencyConflict);
		}

		setTaskStore(
			(task) => task.id === id,
			produce((task) => Object.assign(task, data)),
		);

		if (data.dependencies && data.dependencies !== currentTask.dependencies) {
			if (data.dependencies.length > 0) {
				const newStart =
					Math.max(
						...data.dependencies
							.map((id) => tasks.read(id as Task['id']))
							.filter((task) => !!task)
							.map((task) => task.end as number),
					) + DAY;

				let duration = currentTask.end - currentTask.start;
				duration = Number.isNaN(duration) || duration < 0 ? DAY * 7 : duration;
				const newEnd = newStart + duration;

				setTaskStore(
					(task) => task.id === id,
					produce((task) =>
						Object.assign(task, data, {
							start: newStart,
							end: newEnd,
						}),
					),
				);
			}
		}

		if (updatePredecessors && predecessorsSorted.length > 0 && data.start) {
			if (predecessorsSorted.length > 1) {
				const lastPredecessor = predecessorsSorted[0];
				if (lastPredecessor.end && lastPredecessor.start) {
					const shift = lastPredecessor.end - data.start + DAY;
					tasks.update(
						lastPredecessor.id,
						{
							end: lastPredecessor.end - shift,
						},
						true,
						false,
					);
				}
			} else {
				predecessorsSorted.forEach((predecessor) => {
					if (predecessor.end) {
						let duration = predecessor.end - predecessor.start;
						duration =
							Number.isNaN(duration) || duration <= 0 ? DAY * 7 : duration;

						if (data.start) {
							const newEnd = normalizeDate(data.start - DAY);

							tasks.update(
								predecessor.id,
								{
									end: newEnd,
								},
								false,
								true,
							);
						}
					}
				});
			}
		}
		const successors = taskStore.filter((task) =>
			task.dependencies.includes(id),
		);

		if (updateSuccessors && successors.length > 0) {
			successors.forEach((successor) => {
				if (successor.start && data.end) {
					let duration = successor.end - successor.start;
					duration =
						Number.isNaN(duration) || duration < 0 ? DAY * 7 : duration;

					const newStart = normalizeDate(data.end + DAY);
					const newEnd = normalizeDate(newStart + duration);

					tasks.update(
						successor.id,
						{
							start: newStart,
							end: newEnd,
						},
						false,
						true,
					);
				}
			});
		}
	},

	read: (id: Task['id']) => {
		return taskStore.find((task) => task.id === id);
	},

	delete: (id: Task['id']) => {
		setTaskStore((store) => store.filter((task) => task.id !== id));
	},

	deleteByProject: (id: Project['id']) => {
		setTaskStore((store) => store.filter((task) => task.project !== id));
	},

	list: (): Task[] => taskStore,
	listByProject: (id: Project['id']) =>
		taskStore.filter((task) => task.project === id),
};

// -------------------------------------------------------------------------------------

const err = {
	name: {
		invalid: 'Anna tehtävälle nimi',
		empty: 'Anna tehtävälle nimi',
		tooLong: 'Tehtävän nimen tulee olla enintään 255 merkkiä',
	},
	date: {
		invalid: 'Anna päivämäärä',
		tooEarly: 'dateTooEarly',
		tooLate: 'dateTooLate',
		endBeforeStart: 'Tehtävä ei voi päättyä ennen alkamista',
		dependencyConflict: 'Tehtävä ei voi alkaa ennen riippuvuuksien päättymistä',
	},
};

export const taskTypes = [
	'NetworkConstruction',
	'InvestmentTask',
	'Maintenance',
	'FaultRepair',
	'PlanningTask',
	'Substation',
	'DistributionNetwork',
	'TransmissionNetwork',
	'MaterialsOrder',
	'Inspection',
] as const;

export const taskStatus = [
	'Suunniteltu',
	'Käynnissä',
	'Valmis',
	'Viivästynyt',
] as const;

const DateSchema = v.pipe(
	v.string(),
	v.transform((value) =>
		value ? normalizeDate(new Date(value).getTime()) : Number.NaN,
	),
);

const NameSchema = v.pipe(
	v.string(err.name.empty),
	v.nonEmpty(err.name.empty),
	v.maxLength(255, err.name.tooLong),
);

const TypeSchema = v.pipe(
	v.union([v.literal(''), v.picklist(taskTypes)]),
	v.transform((value) => (value === '' ? undefined : value)),
);

const StatusSchema = v.pipe(
	v.union([v.literal(''), v.picklist(taskStatus)]),
	v.transform((value) => (value === '' ? undefined : value)),
);

const IdSchema = v.pipe(v.string(), v.uuid());

export const TaskSchema = v.pipe(
	v.object({
		name: NameSchema,
		start: DateSchema,
		end: DateSchema,
		type: v.optional(TypeSchema),
		status: v.optional(StatusSchema),
		project: v.optional(v.pipe(v.string(), v.uuid())),
		dependencies: v.optional(v.array(IdSchema), []),
	}),

	// verify start is before end if both are given

	v.forward(
		v.partialCheck(
			[['start'], ['end']],
			({ start, end }) => (start && end ? start <= end : true),
			err.date.endBeforeStart,
		),
		['end'],
	),

	// verify task doesnt start before dependencies end

	v.forward(
		v.partialCheck(
			[['start'], ['dependencies']],

			(input): boolean => {
				if (input.start && input.dependencies) {
					const lastEndDate =
						Math.max(
							...input.dependencies
								.map((id) => tasks.read(id as Task['id']))
								.filter((task) => !!task?.end)
								.map((task) => task?.end as number),
						) || -999999999;

					return input.start >= lastEndDate;
				}

				return true;
			},

			err.date.dependencyConflict,
		),
		['start'],
	),

	// generate id

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: Date.now(),
	})),
);

export const TaskEditSchema = v.pipe(
	v.object({
		...TaskSchema.entries,
	}),

	v.transform((input) => ({
		...input,
	})),
);

export type TaskInput = v.InferInput<typeof TaskSchema>;
export type Task = v.InferOutput<typeof TaskSchema>;
export const ProjectToInput = (task: Task) => {
	return splitProps(task, ['id'])[1];
};

// -------------------------------------------------------------------------------------

type TaskFormProps = {
	form: ReturnType<typeof mf.createForm<TaskInput>>;
	onCancel?: () => void;
	onSubmit: mf.SubmitHandler<TaskInput>;
	children?: JSX.Element;
	project?: Project['id'];
	task?: Task['id'];
};

export const TaskForm = (props: TaskFormProps) => {
	const [_, { Form, Field }] = props.form;
	const Buttons = children(() => props.children);

	const typeOptions = taskTypes.map((type) => ({
		label: type,
		value: type,
	}));

	const statusOptions = taskStatus.map((type) => ({
		label: type,
		value: type,
	}));

	const availableTasks = createMemo(() =>
		(props.project ? tasks.listByProject(props.project) : tasks.list()).filter(
			(task) => task.id !== props.task,
		),
	);

	return (
		<Form onSubmit={props.onSubmit} {...sx.props(style.form)}>
			<Field name="name">
				{(field, props) => (
					<InputField
						{...props}
						type="text"
						label="Tehtävän nimi"
						value={field.value}
						error={field.error}
						required
					/>
				)}
			</Field>
			<Field name="type">
				{(field, props) => (
					<SelectField
						{...props}
						label="Tehtävätyyppi"
						options={typeOptions}
						value={field.value}
						error={field.error}
						placeholder="Valitse tyyppi"
					/>
				)}
			</Field>
			<Field name="status">
				{(field, props) => (
					<SelectField
						{...props}
						label="Tilanne"
						options={statusOptions}
						value={field.value}
						error={field.error}
						placeholder="Valitse tilanne"
					/>
				)}
			</Field>
			<Field name="start">
				{(field, props) => (
					<InputField
						{...props}
						type="date"
						label="Alkaa"
						value={field.value}
						error={field.error}
					/>
				)}
			</Field>
			<Field name="end">
				{(field, props) => (
					<InputField
						{...props}
						type="date"
						label="Päättyy (suunniteltu)"
						value={field.value}
						error={field.error}
					/>
				)}
			</Field>
			<Show when={availableTasks().length > 0}>
				<fieldset>
					<legend>Lisää riippuvuuksia:</legend>

					<div {...sx.props(style.formDependencyWrapper)}>
						<For each={availableTasks()}>
							{({ id, name }) => (
								<Field name="dependencies" type="string[]">
									{(field, fieldProps) => (
										<label {...sx.attrs(style.dependencyLabelWrapper)}>
											<input
												{...fieldProps}
												type="checkbox"
												value={id}
												checked={field.value?.includes(id)}
												onChange={(e) => {
													const current = field.value || [];
													if (e.target.checked) {
														const newValue = [...new Set([...current, id])];
														mf.setValue(props.form[0], field.name, newValue);

														return;
													}
													const newValue = current.filter(
														(value) => value !== id,
													);
													mf.setValue(props.form[0], 'dependencies', newValue);
												}}
											/>
											<span {...sx.props(style.dependencyLabel)}>{name}</span>
										</label>
									)}
								</Field>
							)}
						</For>
					</div>
				</fieldset>
			</Show>
			{Buttons()}
		</Form>
	);
};

// -------------------------------------------------------------------------------------

type TaskCreateFormProps = {
	project: Project['id'];
};

export const TaskCreateForm = (props: TaskCreateFormProps) => {
	const form = mf.createForm<TaskInput>({
		validate: mf.valiForm(TaskSchema),
	});

	const handleSubmit: mf.SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskSchema, data);
		if (validate.success) {
			const tasksByProject = tasks.listByProject(props.project);
			for (const task of tasksByProject) {
				if (task.name === validate.output.name) {
					if (task.id !== validate.output.id) {
						return mf.setError(
							form[0],
							'name',
							'Projektissa on jo tehtävä tällä nimellä',
						);
					}
				}
			}

			setNotification({
				variant: 'success',
				message: notificationMsg.taskCreated,
			});

			tasks.create({
				...validate.output,
				project: props.project,
			});

			return mf.reset(form[0]);
		}

		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
	};

	return (
		<section {...sx.props(style.formWrapper)}>
			<Heading content="Luo tehtävä" level="h2" />
			<TaskForm onSubmit={handleSubmit} form={form} project={props.project}>
				<Button type="submit" variant="primary" label="Luo tehtävä" />
			</TaskForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type TaskEditFormProps = {
	task: Accessor<Task>;
	handleBack?: () => void;
};

export const TaskEditForm = (props: TaskEditFormProps) => {
	const form = mf.createForm<TaskInput>({
		validate: mf.valiForm(TaskSchema),
	});

	const handleSubmit: mf.SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskEditSchema, data);
		if (validate.success) {
			const tasksByProject = tasks.listByProject(
				props.task().project as Project['id'],
			);
			for (const task of tasksByProject) {
				if (task.name === validate.output.name) {
					if (task.id !== props.task().id) {
						return mf.setError(
							form[0],
							'name',
							'Projektissa on jo tehtävä tällä nimellä',
						);
					}
				}
			}

			setNotification({
				variant: 'success',
				message: notificationMsg.taskEdited,
			});

			return tasks.update(props.task().id, validate.output);
		}

		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
	};

	const handleDelete = () => {
		setNotification({
			variant: 'success',
			message: notificationMsg.taskDeleted,
		});

		tasks.delete(props.task().id);

		if (props.handleBack) props.handleBack();
	};

	mf.setValues(form[0], {
		...props.task(),
		start: props.task().start
			? formatDate(getDate(props.task().start as number))
			: '',
		end: props.task().end
			? formatDate(getDate(props.task().end as number))
			: '',
	});

	return (
		<TaskForm
			onSubmit={handleSubmit}
			form={form}
			task={props.task().id}
			project={props.task().project as Project['id']}
		>
			<Button variant="primary" type="submit" label="Tallenna" />
			<Button
				variant="warning"
				type="button"
				label="Poista"
				onClick={handleDelete}
			/>
		</TaskForm>
	);
};

// -------------------------------------------------------------------------------------

type TaskListProps = {
	label: string;
	project?: Project['id'];
	sort?: boolean;
};

export const TaskList = (props: TaskListProps) => {
	const list = createMemo(() => {
		if (!props.sort)
			return props.project ? tasks.listByProject(props.project) : tasks.list();

		return props.project
			? tasks
					.listByProject(props.project)
					.filter((task) => task.end !== null)
					.sort((a, b) => (a.end as number) - (b.end as number))
			: tasks
					.list()
					.filter((task) => task.end)
					.sort((a, b) => (a.end as number) - (b.end as number));
	});

	const getFormattedDate = (dateString: Date) => {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	};

	return (
		<>
			<List label={props.label}>
				<For each={list()} fallback={<div>Ei tulevia tehtäviä</div>}>
					{(task) => {
						const start = createMemo(() => {
							if (!task.start) return undefined;
							return getFormattedDate(new Date(task.start));
						});

						const end = createMemo(() => {
							if (!task.end) return undefined;
							return getFormattedDate(new Date(task.end));
						});

						const project = projects.read(task.project as Project['id']);

						return (
							<ListItem
								href={`/projects/${task.project}/tasks/${task.id}`}
								name={task.name}
								extraStyles={style.listItem}
							>
								<Show when={!props.project}>{project?.name}</Show>
								<Show when={start() || end()}>
									<span>
										{start() ?? ''} <Show when={end()}>- {end()} </Show>
									</span>
								</Show>
							</ListItem>
						);
					}}
				</For>
			</List>
		</>
	);
};

const style = sx.create({
	listItem: {
		display: 'grid',
		gap: '1rem',
		gridTemplateColumns: 'auto auto 1fr',
		justifyItems: 'end',
		alignContent: 'center',
	},

	formWrapper: {
		display: 'flex',
		gap: '1rem',
		flexDirection: 'column',
	},

	form: {
		display: 'flex',
		gap: '.5rem',
		flexDirection: 'column',
		padding: '1rem',
		boxShadow:
			'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px',
		border: '1px solid rgba(0, 0, 0, 0.25)',
	},

	formDependencyWrapper: {
		marginTop: '.25rem',
		padding: '1rem',
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
		border: '1px solid rgba(0, 0, 0, 0.35)',
		maxHeight: '8rem',
		overflowY: 'auto',
	},

	dependencyLabelWrapper: {
		display: 'flex',
		gap: '.5rem',
		alignItems: 'center',
		container: 'dep-wrapper / inline-size',
	},

	dependencyLabel: {
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		maxWidth: '90cqw',
	},
});

// -------------------------------------------------------------------------------------
