import {
	type SubmitHandler,
	createForm,
	reset,
	zodForm,
} from "@modular-forms/solid";
import { v4 } from "uuid";
import { z } from "zod";
import { DateInput } from "./DateInput";
import { TextField } from "./TextField";

const TaskInputSchema = z.object({
	name: z.string().min(1, { message: "Required" }),
	startDate: z.coerce.date(),
	plannedEndDate: z.coerce.date(),
	// TODO: add more properties
});

const TaskSchema = TaskInputSchema.extend({
	id: z.string().uuid(),
	created: z.date(),
	// TODO: add more properties
});

type TaskInput = z.infer<typeof TaskInputSchema>;
type Task = z.infer<typeof TaskSchema>;

export const CreateTaskForm = () => {
	const [createTaskForm, { Form, Field }] = createForm<TaskInput>({
		validate: zodForm(TaskInputSchema),
	});

	const handleSubmit: SubmitHandler<TaskInput> = (data, _) => {
		const task: Task = {
			id: v4(),
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
						value={field.value}
						error={field.error}
					/>
				)}
			</Field>

			<Field name="startDate" type="Date">
				{(field, props) => (
					<DateInput {...props} value={field.value} label="Start Date" />
				)}
			</Field>

			<Field name="plannedEndDate" type="Date">
				{(field, props) => (
					<DateInput {...props} value={field.value} label="Planned End Date" />
				)}
			</Field>

			<button type="submit">Create</button>
		</Form>
	);
};
