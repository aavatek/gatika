import { createForm, reset, valiForm } from '@modular-forms/solid';
import type { SubmitHandler } from '@modular-forms/solid';
import type { Task, TaskInput } from './@.schema';
import { Match, Switch } from 'solid-js';
import { Button } from '$/components/form/Button';
import { InputField } from '$/components/form/Input';
import { TaskSchema } from './@.schema';
import { tasks } from './@.store';
import styles from './@.module.css';
import * as v from 'valibot';

export const TaskForm = () => {
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: valiForm(TaskSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		const validate = v.safeParse(TaskSchema, data);
		if (validate.success) {
			tasks.create(validate.output);
			return reset(createTaskForm);
		}

		console.error(validate.issues);
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
