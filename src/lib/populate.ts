import { makePersisted } from '@solid-primitives/storage';
import { createSignal } from 'solid-js';
import {
	getColor,
	projects,
	setProjectStore,
	setVisited,
	type Project,
} from '@features/Project';
import { setTaskStore } from '@features/Task';
import { DAY, normalizeDate, WEEK } from '@lib/dates';

export const [version, setVersion] = makePersisted(createSignal<string>(), {
	name: 'version',
	storage: localStorage,
});

export const populate = () => {
	const versionKey = '23.11';
	if (version() !== versionKey) {
		setVersion(versionKey);
		setTaskStore(() => []);
		setProjectStore(() => []);
		setVisited(() => []);

		const PA: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti A',
			created: Date.now(),
			color: getColor(),
		};

		projects.create(PA);

		const PB: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti B',
			created: Date.now() + 1,
			color: getColor(),
		};
		projects.create(PB);

		const PC: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti C',
			created: Date.now() + 2,
			color: getColor(),
		};
		projects.create(PC);

		const PD: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti D',
			created: Date.now() + 3,
			color: getColor(),
		};
		projects.create(PD);

		const A1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A1',
			start: normalizeDate(Date.now() - WEEK),
			end: normalizeDate(Date.now()),
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const A2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A2',
			start: normalizeDate(Date.now() + DAY),
			end: normalizeDate(Date.now() + DAY + WEEK),
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const A3 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A3',
			start: normalizeDate(Date.now() + DAY * 2 + WEEK),
			end: normalizeDate(Date.now() + DAY * 2 + WEEK * 2),
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const A4 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A4',
			start: normalizeDate(Date.now() + DAY),
			end: normalizeDate(Date.now() + WEEK * 2),
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const B1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä B1',
			start: normalizeDate(Date.now() - WEEK),
			end: Number.NaN,
			project: PB.id,
			dependencies: [],
			created: Date.now(),
		};

		const B2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä B2',
			start: Number.NaN,
			end: normalizeDate(Date.now() + WEEK + DAY * 2),
			project: PB.id,
			dependencies: [],
			created: Date.now(),
		};

		const C1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä C1',
			start: normalizeDate(Date.now() - WEEK * 2 + DAY * 4),
			end: normalizeDate(Date.now() - WEEK + DAY * 4),
			project: PC.id,
			dependencies: [],
			created: Date.now(),
		};

		const C2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä C2',
			start: Number.NaN,
			end: Number.NaN,
			project: PC.id,
			dependencies: [],
			created: Date.now(),
		};

		const D1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä D1',
			start: normalizeDate(Date.now() - WEEK * 2 + DAY * 4),
			end: normalizeDate(Date.now() - WEEK + DAY * 4),
			project: PD.id,
			dependencies: [],
			created: Date.now(),
		};

		const D2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä D2',
			start: Number.NaN,
			end: Number.NaN,
			project: PD.id,
			dependencies: [],
			created: Date.now(),
		};

		const D3 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä D3',
			start: Number.NaN,
			end: Number.NaN,
			project: PD.id,
			dependencies: [],
			created: Date.now(),
		};

		setTaskStore([A1, A2, A3, A4, B1, B2, C1, C2, D1, D2, D3]);
	}
};
