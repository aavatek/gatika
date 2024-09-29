import { Button } from '$components/form/Button';
import { InputField } from '$components/form/InputField';
import { tasks } from '$lib/api';
import { createForm, reset, valiForm } from '@modular-forms/solid';
import type { SubmitHandler } from '@modular-forms/solid';
import { useNavigate } from '@solidjs/router';
import { For } from 'solid-js';
import * as v from 'valibot';
import { type Task, type TaskInput, TaskSchema } from './Task.model';

export const TaskForm = () => {
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: valiForm(TaskSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		try {
			const taskData: Task = v.parse(TaskSchema, data);
			tasks.create(taskData);
			reset(createTaskForm);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<Form onSubmit={handleSubmit}>
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
			<ul>
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
		<li>
			<span>{props.name}</span>
			<Button content="Hallitse" onclick={handleViewTask} />
		</li>
	);
};
