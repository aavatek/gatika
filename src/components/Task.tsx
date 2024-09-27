import type { SubmitHandler } from '@modular-forms/solid';
import { createForm, reset, valiForm } from '@modular-forms/solid';
import type { InferOutput } from 'valibot';
import * as v from 'valibot';
import { Button } from './form/Button';
import { DateField } from './form/DateField';
import { TextField } from './form/TextField';

const TaskInputSchema = v.object({
	name: v.pipe(v.string('Invalid'), v.nonEmpty('Required')),
	startDate: v.date(),
	endDate: v.date(),
});

const TaskSchema = v.object({
	...TaskInputSchema.entries,
	id: v.pipe(v.string(), v.uuid()),
	created: v.date(),
});

type TaskInput = InferOutput<typeof TaskInputSchema>;
type Task = InferOutput<typeof TaskSchema>;

export const TaskForm = () => {
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: valiForm(TaskInputSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		const task: Task = {
			id: crypto.randomUUID(),
			created: new Date(),
			...data,
		};

		// TODO: do something with task here
		console.log(task);

		// reset form after
		reset(createTaskForm);
	};

	return (
		<Form onSubmit={handleSubmit}>
			<Field name="name">
				{(field, props) => (
					<TextField
						{...props}
						type="text"
						label="Name"
						placeholder="Task Name"
						value={field.value}
						error={field.error}
					/>
				)}
			</Field>

			<Field name="startDate" type="Date">
				{(field, props) => (
					<DateField {...props} value={field.value} label="Start Date" />
				)}
			</Field>

			<Field name="endDate" type="Date">
				{(field, props) => (
					<DateField {...props} value={field.value} label="End Date" />
				)}
			</Field>

			<Button type="submit" content="Create" />
		</Form>
	);
};
