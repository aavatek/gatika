import { getTime } from '@solid-primitives/date';
import * as v from 'valibot';
import { tasks } from './@.store';

const err = {
	name: {
		empty: 'Syötä nimi',
		tooLong: 'Nimi on liian pitkä',
	},
	date: {
		invalid: 'Syötä päivämäärä',
		tooEarly: 'Vähintään 01.01.1950',
		tooLate: 'Enintään 31.12.2050',
		endBeforeStart: 'Tehtävä ei voi päättyä ennen alkamista',
	},
};

export const taskTypes = [
	'',
	'NetworkConstruction',
	'InvestmentTask',
	'Maintenance',
	'FaultRepair',
	'PlanningTask',
	'Substation',
	'DistributionNetwork',
	'TransmissionNetwork',
	'MaterialsOrder',
	'Inspection',
] as const;

const DateSchema = v.pipe(
	v.string(),
	v.transform((value) => new Date(value)),
	v.date(err.date.invalid),
	v.minValue(new Date('1950-01-01'), err.date.tooEarly),
	v.maxValue(new Date('2050-12-31'), err.date.tooLate),
);

const NameSchema = v.pipe(
	v.string(err.name.empty),
	v.nonEmpty(err.name.empty),
	v.maxLength(255, err.name.tooLong),
);

const IdSchema = v.pipe(v.string(), v.uuid());
const TypeSchema = v.picklist(taskTypes);

export const TaskSchema = v.pipe(
	v.object({
		name: NameSchema,
		startDate: DateSchema,
		endDate: DateSchema,
		type: TypeSchema,
		dependants: v.optional(v.array(IdSchema)),
		dependencies: v.optional(v.array(IdSchema)),
	}),

	v.forward(
		v.partialCheck(
			[['startDate'], ['endDate']],
			({ startDate, endDate }) =>
				startDate && endDate ? startDate <= endDate : true,
			err.date.endBeforeStart,
		),
		['endDate'],
	),

	v.forward(
		v.partialCheck(
			[['startDate'], ['dependencies']],

			// biome-ignore lint: <TODO: figure out a type safe way>
			(input): any => {
				if (input.startDate && input.dependencies) {
					const sortedEndDates = input.dependencies
						.map((id) => tasks.read(id))
						.map((task) => task()?.endDate)
						.filter((date) => date !== undefined)
						.sort((a, b) => getTime(b) - getTime(a));

					return sortedEndDates.length > 0
						? getTime(input.startDate) > getTime(sortedEndDates[0])
						: true;
				}

				return true;
			},
			'Tehtävä ei voi alkaa ennen edeltävien tehtävien päättymistä',
		),
		['startDate'],
	),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: new Date(),
	})),
);

export const TaskEditSchema = v.object({
	...TaskSchema.entries,
});

export type TaskInput = v.InferInput<typeof TaskSchema>;
export type Task = v.InferOutput<typeof TaskSchema>;
