import * as v from 'valibot';
import type { SubmitHandler } from '@modular-forms/solid';
import { createForm, reset, setValues, valiForm } from '@modular-forms/solid';
import { createMemo, For, Match, Switch } from 'solid-js';
import { Link } from '$/components/Nav';
import { Button } from '$/components/form/Button';
import { InputField } from '$/components/form/InputField';
import type { Task, TaskInput } from './Task.model';
import { TaskSchema, TaskInputSchema } from './Task.model';
import { tasks } from '$/lib/api';
import styles from './Task.module.css';
import { useNavigate } from '@solidjs/router';
import {
	createDate,
	formatDate,
	getDate,
	getDateDifference,
} from '@solid-primitives/date';

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

type TaskFormProps = {
	task?: Task;
};

export const TaskForm = (props: TaskFormProps) => {
	const navigate = useNavigate();
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: valiForm(TaskInputSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		try {
			if (props.task) {
				tasks.update(props.task.id, {
					...props.task,
					...data,
					updated: new Date(),
				});
			} else {
				tasks.create(
					v.parse(TaskSchema, {
						...v.parse(TaskInputSchema, data),
						id: crypto.randomUUID(),
						created: new Date(),
						updated: new Date(),
					}),
				);

				reset(createTaskForm);
			}
		} catch (e) {
			handleError(e as Error);
		}
	};

	const handleError = (error: Error) => {
		console.error(error);
	};

	const handleCancel = () => {
		navigate(-1);
	};

	if (props.task) {
		setValues(createTaskForm, { name: props.task.name });
		if (props.task.startDate) {
			setValues(createTaskForm, {
				startDate: new Date(props.task.startDate),
			});
		}
		if (props.task.endDate) {
			setValues(createTaskForm, {
				endDate: new Date(props.task.endDate),
			});
		}
	}

	return (
		<section class={styles.taskFormWrapper}>
			<Switch>
				<Match when={props.task}>
					<h2>Muokkaa</h2>
				</Match>
				<Match when={!props.task}>
					<h2>Luo tehtävä</h2>
				</Match>
			</Switch>

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

				<Switch>
					<Match when={props.task}>
						<Button type="submit" content="Tallenna" />
						<Button type="button" content="Peruuta" onClick={handleCancel} />
					</Match>
					<Match when={!props.task}>
						<Button type="submit" content="Luo tehtävä" />
					</Match>
				</Switch>
			</Form>
		</section>
	);
};
