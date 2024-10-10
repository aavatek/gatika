import { type Accessor, type JSX, children } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { formatDate } from '@solid-primitives/date';
import * as mf from '@modular-forms/solid';
import * as v from 'valibot';
import { Button } from '$components/form/Button';
import { InputField } from '$components/form/Input';
import { Select } from '$components/form/Select';
import { TaskEditSchema, TaskSchema, taskStatus, taskTypes } from './@.schema';
import type { Task, TaskInput } from './@.schema';
import { tasks } from './@.store';
import type { Project } from '$features/project/@.schema';

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

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
					<Select
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
					<Select
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

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

type CreateTaskFormProps = {
	projectID: Project['id'];
};

export const CreateTaskForm = (props: CreateTaskFormProps) => {
	const form = mf.createForm<TaskInput>({
		validate: mf.valiForm(TaskSchema),
	});

	const handleSubmit: mf.SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskSchema, data);
		if (validate.success) {
			tasks.create({
				...validate.output,
				project: props.projectID,
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

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

type EditTaskFormProps = {
	task: Accessor<Task>;
};

export const EditTaskForm = (props: EditTaskFormProps) => {
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

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------
