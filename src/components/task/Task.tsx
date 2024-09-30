import * as v from 'valibot';
import type { SubmitHandler } from '@modular-forms/solid';
import { createForm, reset, valiForm } from '@modular-forms/solid';
import { For } from 'solid-js';
import { Link } from '$/components/Nav';
import { Button } from '$/components/form/Button';
import { InputField } from '$/components/form/InputField';
import { type Task, type TaskInput, TaskSchema } from './Task.model';
import { tasks } from '$/lib/api';
import styles from './Task.module.css';

export const TaskList = () => {
	return (
		<section class={styles.taskListWrapper}>
			<h2>Kaikki tehtävät</h2>
			<ol class={styles.taskList}>
				<For each={tasks.list()}>
					{(task: Task) => <TaskListItem {...task} />}
				</For>
			</ol>
		</section>
	);
};

const TaskListItem = (props: Task) => {
	return (
		<li class={styles.taskListItem}>
			<span>{props.name}</span>
			<Link href={`/tasks/${props.id}`} label="Näytä" />
		</li>
	);
};

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
		<section class={styles.taskFormWrapper}>
			<h2>Luo tehtävä</h2>
			<Form onSubmit={handleSubmit} class={styles.taskForm}>
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
		</section>
	);
};
