import type { Accessor, JSX } from 'solid-js';
import { For, children, createMemo, splitProps } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { formatDate, getTime } from '@solid-primitives/date';
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
		empty: 'Syötä nimi',
		tooLong: 'Nimi on liian pitkä',
	},
	date: {
		invalid: 'Syötä päivämäärä',
		tooEarly: 'Vähintään 01.01.1950',
		tooLate: 'Enintään 31.12.2050',
		endBeforeStart: 'Tehtävä ei voi päättyä ennen alkamista',
		dependencyConflict:
			'Tehtävä ei voi alkaa ennen edeltävien tehtävien päättymistä',
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
	v.transform((value) => new Date(value)),
	v.date(err.date.invalid),
	v.minValue(new Date('1950-01-01'), err.date.tooEarly),
	v.maxValue(new Date('2050-12-31'), err.date.tooLate),
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
		startDate: DateSchema,
		endDate: DateSchema,
		type: v.optional(TypeSchema),
		status: v.optional(StatusSchema),
		project: v.optional(v.pipe(v.string(), v.uuid())),
		dependants: v.optional(v.array(IdSchema)),
		dependencies: v.optional(v.array(IdSchema)),
	}),

	v.forward(
		v.partialCheck(
			[['startDate'], ['endDate']],
			({ startDate, endDate }) =>
				startDate && endDate ? startDate <= endDate : true,
			err.date.endBeforeStart,
		),
		['endDate'],
	),

	v.forward(
		v.partialCheck(
			[['startDate'], ['dependencies']],

			// biome-ignore lint: <TODO: figure out a type safe way>
			(input): any => {
				if (input.startDate && input.dependencies) {
					const sortedEndDates = input.dependencies
						.map((id) => tasks.read(id as Task['id']))
						.map((task) => task()?.endDate)
						.filter((date) => date !== undefined)
						.sort((a, b) => getTime(b) - getTime(a));

					return sortedEndDates.length > 0
						? getTime(input.startDate) > getTime(sortedEndDates[0])
						: true;
				}

				return true;
			},
			err.date.dependencyConflict,
		),
		['startDate'],
	),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
	})),
);

export const TaskEditSchema = v.object({
	...TaskSchema.entries,
});

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
};

export const TaskForm = (props: TaskFormProps) => {
	const [_, { Form, Field }] = props.form;
	const Buttons = children(() => props.children);

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
						options={taskTypes}
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
						options={taskStatus}
						value={field.value}
						error={field.error}
						placeholder="Valitse tilanne"
					/>
				)}
			</Field>

			<Field name="startDate">
				{(field, props) => (
					<InputField
						{...props}
						type="date"
						label="Alkaa"
						value={field.value}
						error={field.error}
						required
					/>
				)}
			</Field>

			<Field name="endDate">
				{(field, props) => (
					<InputField
						{...props}
						type="date"
						label="Päättyy (suunniteltu)"
						value={field.value}
						error={field.error}
						required
					/>
				)}
			</Field>

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
			<TaskForm onSubmit={handleSubmit} form={form}>
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
		startDate: formatDate(new Date(props.task().startDate)),
		endDate: formatDate(new Date(props.task().endDate)),
	});

	return (
		<section>
			<h2>Muokkaa tehtävää</h2>
			<TaskForm onSubmit={handleSubmit} form={form}>
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
	return (
		<li>
			<span>{props.task.name}</span>
			<A
				href={`/projects/${props.project}/tasks/${props.task.id}`}
				innerText="Näytä"
			/>
		</li>
	);
};

// -------------------------------------------------------------------------------------
