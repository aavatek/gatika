import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import type { Project } from './@.schema';

const [store, setStore] = makePersisted(createStore<Project[]>([]), {
	name: 'projects',
	storage: localStorage,
	sync: storageSync,
});

export const projects = {
	create: (project: Project) => {
		setStore(
			produce((store) => {
				store.push(project);
			}),
		);
	},

	read: (id: string) =>
		createMemo(() => store.find((project) => project.id === id)),

	update: (id: string, data: Partial<Project>) => {
		setStore(
			(project) => project.id === id,
			produce((project) => Object.assign(project, data)),
		);
	},

	delete: (id: string) => {
		setStore((store) => store.filter((project) => project.id !== id));
	},

	list: () => store,
};
