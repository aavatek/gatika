import { createForm, reset, valiForm } from '@modular-forms/solid';
import type { SubmitHandler } from '@modular-forms/solid';
import { useNavigate } from '@solidjs/router';
import { For } from 'solid-js';
import * as v from 'valibot';
import { tasks } from '../lib/api';
import { Button } from './form/Button';
import { InputField } from './form/InputField';

const TaskSchema = v.pipe(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty('Required')),
		startDate: v.optional(v.date()),
		endDate: v.optional(v.date()),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: new Date().toISOString(),
	})),
);

export type TaskInput = v.InferInput<typeof TaskSchema>;
export type Task = v.InferOutput<typeof TaskSchema>;

export const TaskForm = () => {
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: valiForm(TaskSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		try {
			tasks.create(v.parse(TaskSchema, data));
			reset(createTaskForm);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<Form onSubmit={handleSubmit} class="task-form">
			<Field name="name">
				{(field, props) => (
					<InputField
						{...props}
						type="text"
						label="Tehtävän nimi"
						placeholder="esim. Liittymätyö"
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

			<Button type="submit" content="Luo tehtävä" />
		</Form>
	);
};

export const TaskList = () => {
	return (
		<section>
			<h2>Tehtävät</h2>
			<ul class="task-list">
				<For each={tasks.list()}>
					{(task: Task) => <TaskListItem {...task} />}
				</For>
			</ul>
		</section>
	);
};

const TaskListItem = (props: Task) => {
	const navigate = useNavigate();

	const handleViewTask = () => {
		navigate(`/tasks/${props.id}`);
	};

	return (
		<li class="task-list-item">
			<span>{props.name}</span>
			<Button content="Hallitse" onclick={handleViewTask} />
		</li>
	);
};
