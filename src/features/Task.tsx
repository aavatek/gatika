import type { Accessor, JSX } from 'solid-js';
import { For, Show, children, createMemo, splitProps } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import {
	getTime,
	getDate,
	formatDate,
	getDateDifference,
	DAY,
} from '@solid-primitives/date';
import * as mf from '@modular-forms/solid';
import * as v from 'valibot';
import { Button, InputField, SelectField } from '@components/Form';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { createStore, produce } from 'solid-js/store';
import type { Project } from './Project';

// -------------------------------------------------------------------------------------

const [store, setStore] = makePersisted(createStore<Task[]>([]), {
	name: 'tasks',
	storage: localStorage,
	sync: storageSync,
});

export const tasks = {
	create: (task: Task) => {
		setStore(
			produce((store) => {
				store.push(task);
			}),
		);
	},

	read: (id: Task['id']) =>
		createMemo(() => store.find((task) => task.id === id)),

	update: (id: Task['id'], data: Partial<Task>) => {
		setStore(
			(task) => task.id === id,
			produce((task) => Object.assign(task, data)),
		);

		if (data.end) {
			const dependants = tasks
				.list()
				.filter((task) => task.dependencies.includes(id));
			for (const dependant of dependants) {
				if (!dependant.start) return;

				const newStart = getDate(getTime(new Date(data.end)) + DAY);
				if (getTime(newStart) > getTime(new Date(dependant.start))) {
					const newEnd = dependant.duration
						? getDate(getTime(newStart) + dependant.duration * DAY)
						: undefined;

					tasks.update(dependant.id, { start: newStart, end: newEnd });
				}
			}
		}
	},

	delete: (id: Task['id']) => {
		setStore((store) => store.filter((task) => task.id !== id));
	},

	deleteByProject: (id: Project['id']) => {
		setStore((store) => store.filter((task) => task.project !== id));
	},

	list: () => store,
	listByProject: (id: Project['id']) =>
		store.filter((task) => task.project === id),
};

// -------------------------------------------------------------------------------------

const err = {
	name: {
		invalid: 'nameInvalid',
		empty: 'nameEmpty',
		tooLong: 'nameTooLong',
	},
	date: {
		invalid: 'dateInvalid',
		tooEarly: 'dateTooEarly',
		tooLate: 'dateTooLate',
		endButNoStart: 'dateEndButNoStart',
		endBeforeStart: 'dateEndBeforeStart',
		dependencyConflict: 'dateDependancyConflict',
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
	v.transform((value) => (value ? new Date(value) : undefined)),

	v.optional(
		v.pipe(
			v.date(err.date.invalid),
			v.minValue(new Date('1950-01-01'), err.date.tooEarly),
			v.maxValue(new Date('2050-12-31'), err.date.tooLate),
		),
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

	// verify start is given if end is given

	v.forward(
		v.partialCheck(
			[['start'], ['end']],
			({ start, end }) => !(end && !start),
			err.date.endButNoStart,
		),
		['end'],
	),

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
					const sortedEndDates = input.dependencies
						.map((id) => tasks.read(id as Task['id']))
						.map((task) => task()?.end)
						.filter((date) => date !== undefined)
						.sort((a, b) => getTime(b) - getTime(a));

					return sortedEndDates.length > 0
						? getTime(input.start) > getTime(sortedEndDates[0])
						: true;
				}

				return true;
			},
			err.date.dependencyConflict,
		),
		['start'],
	),

	// generate id and calculate duration

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		duration:
			input.start && input.end
				? getDateDifference(input.start, input.end) / DAY
				: undefined,
	})),
);

export const TaskEditSchema = v.pipe(
	v.object({
		...TaskSchema.entries,
	}),

	v.transform((input) => ({
		...input,
		duration:
			input.start && input.end
				? getDateDifference(input.start, input.end) / DAY
				: undefined,
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
	const [_, { Form, Field, FieldArray }] = props.form;
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
		<Form onSubmit={props.onSubmit}>
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

			<FieldArray name="dependencies">
				{(deps) => (
					<div>
						<For each={deps.items}>
							{(_, index) => (
								<div>
									<Field name={`${deps.name}.${index()}`}>
										{(field, props) => (
											<SelectField
												{...props}
												label="Dependent Task"
												value={field.value}
												error={field.error}
												options={availableTasks().map((task) => ({
													label: task.name,
													value: task.id,
												}))}
											/>
										)}
									</Field>
									<Button
										label="Remove"
										onClick={() =>
											mf.remove(props.form[0], deps.name, {
												at: index(),
											})
										}
									/>
								</div>
							)}
						</For>
						<Button
							type="button"
							label="Lisää riippuvuuksia?"
							onClick={() => {
								const availableTask = availableTasks().find(
									(task) =>
										!deps.items.some(
											(_, i) =>
												mf.getValue(props.form[0], `${deps.name}.${i}`) ===
												task.id,
										),
								);
								if (availableTask) {
									mf.insert(props.form[0], deps.name, {
										value: availableTask.id,
									});
								}
							}}
						/>
					</div>
				)}
			</FieldArray>

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
			tasks.create({
				...validate.output,
				project: props.project,
			});

			return mf.reset(form[0]);
		}

		console.error(validate.issues);
	};

	return (
		<section>
			<h2>Luo tehtävä</h2>
			<TaskForm onSubmit={handleSubmit} form={form} project={props.project}>
				<Button type="submit" label="Luo tehtävä" />
			</TaskForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type TaskEditFormProps = {
	task: Accessor<Task>;
};

export const TaskEditForm = (props: TaskEditFormProps) => {
	const navigate = useNavigate();
	const form = mf.createForm<TaskInput>({
		validate: mf.valiForm(TaskSchema),
	});

	const handleSubmit: mf.SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskEditSchema, data);
		if (validate.success) {
			return tasks.update(props.task().id, validate.output);
		}

		console.error(validate.issues);
	};

	mf.setValues(form[0], {
		...props.task(),
		start: props.task().start
			? formatDate(getDate(props.task().start as Date))
			: '',
		end: props.task().end ? formatDate(getDate(props.task().end as Date)) : '',
	});

	return (
		<section>
			<h2>Muokkaa tehtävää</h2>
			<TaskForm
				onSubmit={handleSubmit}
				form={form}
				task={props.task().id}
				project={props.task().project as Project['id']}
			>
				<Button type="submit" label="Tallenna" />
				<Button label="Peruuta" onclick={() => navigate(-1)} />
			</TaskForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type TaskListProps = {
	project: Project['id'];
};

export const TaskList = (props: TaskListProps) => {
	return (
		<section>
			<h2>Kaikki tehtävät</h2>
			<ol>
				<For each={tasks.listByProject(props.project)}>
					{(task: Task) => <TaskListItem task={task} project={props.project} />}
				</For>
			</ol>
		</section>
	);
};

type TaskListItemProps = {
	task: Task;
	project: Project['id'];
};

const TaskListItem = (props: TaskListItemProps) => {
	const getFormattedDate = (dateString: Date) => {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	};

	const start = createMemo(() => {
		if (!props.task.start) return undefined;
		return getFormattedDate(new Date(props.task.start));
	});

	const end = createMemo(() => {
		if (!props.task.end) return undefined;
		return getFormattedDate(new Date(props.task.end));
	});

	return (
		<li>
			<p>{props.task.name}: </p>

			<Show when={start()}>
				<p>
					{start()} <Show when={end()}>- {end()} </Show>
				</p>
			</Show>

			<A
				href={`/projects/${props.project}/tasks/${props.task.id}`}
				innerText="Näytä"
			/>
		</li>
	);
};

// -------------------------------------------------------------------------------------
