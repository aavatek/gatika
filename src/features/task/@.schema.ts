import * as v from 'valibot';

const err = {
	name: {
		empty: 'Nimi ei voi olla tyhjä',
		tooLong: 'Nimi on liian pitkä',
	},
	date: {
		invalid: 'Viallinen päivämäärä',
		tooEarly: 'Vähintään 01.01.1950',
		tooLate: 'Enintään 31.12.2050',
		endBeforeStart: 'Tehtävä ei voi päättyä ennen alkamista',
	},
};

const DateSchema = v.pipe(
	v.date(err.date.invalid),
	v.minValue(new Date('1950-01-01'), err.date.tooEarly),
	v.maxValue(new Date('2050-12-31'), err.date.tooLate),
);

const NameSchema = v.pipe(
	v.string(),
	v.nonEmpty(err.name.empty),
	v.maxLength(255, err.name.tooLong),
);

export const TaskSchema = v.pipe(
	v.object({
		name: NameSchema,
		startDate: v.optional(DateSchema),
		endDate: v.optional(DateSchema),
	}),

	v.forward(
		v.partialCheck(
			[['startDate'], ['endDate']],
			({ startDate, endDate }) =>
				startDate && endDate ? startDate < endDate : true,
			err.date.endBeforeStart,
		),
		['endDate'],
	),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: new Date(),
	})),
);

export type TaskInput = v.InferInput<typeof TaskSchema>;
export type Task = v.InferOutput<typeof TaskSchema>;
