import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import type { Task } from './@.schema';

const [store, setStore] = makePersisted(createStore<Task[]>([]), {
	name: 'tasks',
	storage: localStorage,
	sync: storageSync,
});

export const tasks = {
	create: (task: Task) => {
		setStore(
			produce((store) => {
				store.push(task);
			}),
		);
	},

	read: (id: string) => createMemo(() => store.find((task) => task.id === id)),

	update: (id: string, data: Partial<Task>) => {
		setStore(
			(task) => task.id === id,
			produce((task) => Object.assign(task, data)),
		);
	},

	delete: (id: string) => {
		setStore((store) => store.filter((task) => task.id !== id));
	},

	list: () => store,
};
