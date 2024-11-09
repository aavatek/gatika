import { makePersisted } from '@solid-primitives/storage';
import { createSignal } from 'solid-js';
import { setProjectStore, setVisited, type Project } from '@features/Project';
import { setTaskStore } from '@features/Task';
import { DAY, WEEK } from './dates';

export const [version, setVersion] = makePersisted(createSignal<string>(), {
	name: 'version',
	storage: localStorage,
});

export const populate = () => {
	const versionKey = '04.11';
	if (version() !== versionKey) {
		setVersion(versionKey);
		setTaskStore(() => []);
		setProjectStore(() => []);
		setVisited(() => []);

		const PA: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti A',
			created: Date.now(),
			color: '#AECEFF',
		};

		const PB: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti B',
			created: Date.now() + DAY,
			color: '#FAEEC1',
		};

		const PC: Project = {
			id: crypto.randomUUID(),
			name: 'Projekti C',
			created: Date.now() + DAY * 2,
			color: '#D9BCAF',
		};

		const A1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A1',
			start: Date.now() - WEEK,
			end: Date.now(),
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const A2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A2',
			start: Date.now() + DAY,
			end: Date.now() + DAY + WEEK,
			project: PA.id,
			dependencies: [A1.id],
			created: Date.now(),
		};

		const A3 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A3',
			start: Date.now() + DAY * 2 + WEEK,
			end: Date.now() + DAY * 2 + WEEK * 2,
			project: PA.id,
			dependencies: [A2.id],
			created: Date.now(),
		};

		const A4 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A4',
			start: Date.now() + DAY,
			end: Date.now() + WEEK * 2,
			project: PA.id,
			dependencies: [A1.id],
			created: Date.now(),
		};

		const A5 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä A5',
			start: Date.now() - WEEK * 3,
			end: Date.now() + WEEK,
			project: PA.id,
			dependencies: [],
			created: Date.now(),
		};

		const B1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä B1 (ei loppua)',
			start: Date.now() - WEEK,
			end: Number.NaN,
			project: PB.id,
			dependencies: [],
			created: Date.now(),
		};

		const B2 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä B2 (ei alkua)',
			start: Number.NaN,
			end: Date.now() + WEEK * 2,
			project: PB.id,
			dependencies: [],
			created: Date.now(),
		};

		const C1 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä C1',
			start: Number.NaN,
			end: Number.NaN,
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

		const C3 = {
			id: crypto.randomUUID(),
			name: 'Tehtävä C3',
			start: Number.NaN,
			end: Number.NaN,
			project: PC.id,
			dependencies: [],
			created: Date.now(),
		};

		setProjectStore([PA, PB, PC]);
		setTaskStore([A1, A2, A3, A4, A5, B1, B2, C1, C2, C3]);
	}
};
