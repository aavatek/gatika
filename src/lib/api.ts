import { makePersisted, storageSync } from '@solid-primitives/storage';
import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type { Task } from '../components/Task';

export const [taskStore, setTaskStore, init] = makePersisted(
	createStore<Task[]>([]),
	{
		name: 'taskStore',
		storage: localStorage,
		sync: storageSync,
	},
);

export const tasks = {
	create: (task: Task) => {
		setTaskStore(
			produce((store) => {
				store.push(task);
			}),
		);
	},

	read: (id: string) =>
		createMemo(() => taskStore.find((task) => task.id === id)),

	update: (id: string, updatedTask: Partial<Task>) => {
		setTaskStore(
			(task) => task.id === id,
			produce((task) => Object.assign(task, updatedTask)),
		);
	},

	delete: (id: string) => {
		setTaskStore((store) => store.filter((task) => task.id !== id));
	},

	list: () => taskStore,
};
