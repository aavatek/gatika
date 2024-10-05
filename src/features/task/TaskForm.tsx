import { createForm, reset, setValues, valiForm } from '@modular-forms/solid';
import type { SubmitHandler } from '@modular-forms/solid';
import type { Task, TaskInput } from './@.schema';
import type { Accessor, JSX } from 'solid-js';
import { Button } from '$/components/form/Button';
import { InputField } from '$/components/form/Input';
import { TaskEditSchema, TaskSchema, taskTypes } from './@.schema';
import { tasks } from './@.store';
import styles from './@.module.css';
import * as v from 'valibot';
import { useNavigate } from '@solidjs/router';
import { Select } from '$/components/form/Select';

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

type TaskFormProps = {
	form: ReturnType<typeof createForm<TaskInput>>;
	onCancel?: () => void;
	onSubmit: SubmitHandler<TaskInput>;
	children?: JSX.Element;
};

export const TaskForm = (props: TaskFormProps) => {
	const [, { Form, Field }] = props.form;

	return (
		<Form onSubmit={props.onSubmit} class={styles.taskForm}>
			<Field name="name">
				{(field, props) => (
					<InputField
						{...props}
						type="text"
						label="Tehtävän nimi"
						value={field.value}
						error={field.error}
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
					/>
				)}
			</Field>

			<Field name="startDate" type="Date">
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

			<Field name="endDate" type="Date">
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

			{/* buttons */}
			{props.children}
		</Form>
	);
};

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

export const CreateTaskForm = () => {
	const form = createForm<TaskInput>({
		validate: valiForm(TaskSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskSchema, data);
		if (validate.success) {
			tasks.create(validate.output);
			return reset(form[0]);
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
	const form = createForm<TaskInput>({
		validate: valiForm(TaskSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskEditSchema, data);
		if (validate.success) {
			return tasks.update(props.task().id, validate.output);
		}

		console.error(validate.issues);
	};

	setValues(form[0], { ...props.task() });

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
