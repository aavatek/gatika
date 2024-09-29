import * as v from 'valibot';

export const TaskSchema = v.pipe(
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
