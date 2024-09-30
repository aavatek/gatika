import * as v from 'valibot';

const DateSchema = v.pipe(
	v.date('Anna päivämäärä'),
	v.minValue(new Date('1950-01-01'), 'Vähintään 01.01.1950'),
	v.maxValue(new Date('2050-12-31'), 'Enintään 31.12.2050'),
);

const NameSchema = v.pipe(
	v.string(),
	v.nonEmpty('Anna nimi'),
	v.maxLength(255, 'Nimi on liian pitkä'),
);

export const TaskInputSchema = v.pipe(
	v.object({
		name: NameSchema,
		startDate: v.optional(DateSchema),
		endDate: v.optional(DateSchema),
	}),

	v.forward(
		v.partialCheck(
			[['startDate'], ['endDate']],
			(input) => {
				return input.startDate && input.endDate
					? input.startDate < input.endDate
					: true;
			},
			'Tehtävä ei voi päättyä ennen alkamista',
		),
		['endDate'],
	),
);

export const TaskSchema = v.object({
	...TaskInputSchema.entries,
	id: v.pipe(v.string(), v.uuid()),
	created: v.date(),
	updated: v.optional(v.date()),
	duration: v.optional(v.number()),
});

export type TaskInput = v.InferOutput<typeof TaskInputSchema>;
export type Task = v.InferOutput<typeof TaskSchema>;
