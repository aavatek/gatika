import * as v from 'valibot';
import { TaskSchema } from '../task/@.schema';

export const ProjectSchema = v.pipe(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		tasks: v.optional(v.array(TaskSchema)),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: new Date(),
	})),
);

export const ProjectEditSchema = v.pipe(
	v.object({
		...ProjectSchema.entries,
	}),

	v.transform((input) => ({
		...input,
		updated: new Date(),
	})),
);

export type ProjectInput = v.InferInput<typeof ProjectSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;

export const ProjectToInput = (project: Project) => {
	const { id, created, tasks, ...input } = project;
	return { ...input };
};
