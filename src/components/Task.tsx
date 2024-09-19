import {
	type SubmitHandler,
	createForm,
	reset,
	zodForm,
} from "@modular-forms/solid";
import { v4 } from "uuid";
import { z } from "zod";

const TaskInputSchema = z.object({
	name: z.string().min(1, { message: "Required" }),
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
					<>
						<label for={field.name}>Name</label>
						<input id={field.name} value={field.value} type="text" {...props} />
						{field.error && <p>{field.error}</p>}
					</>
				)}
			</Field>

			<button type="submit">Create</button>
		</Form>
	);
};
