import { createMemo, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import { formatDate, getTime } from '@solid-primitives/date';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { tasks } from '@features/Task';
import { projects, type Project } from '@features/Project';

export const [visited, setVisited] = makePersisted(
	createSignal<Project['id'][]>([]),
	{
		name: 'visitedProjects',
		storage: localStorage,
		sync: storageSync,
	},
);

export const addToLastVisited = (id: Project['id']) => {
	if (visited().find((curr) => curr === id)) {
		setVisited(visited().filter((curr) => id !== curr));
	}

	setVisited((prev) => [id, ...prev]);
};

export const Dashboard = () => {
	const tasksSorted = tasks
		.list()
		.filter((task) => task.end)
		.sort(
			(a, b) =>
				getTime(new Date(a.end as Date)) - getTime(new Date(b.end as Date)),
		);

	const lastVisited = createMemo(() =>
		visited().map((id) => projects.read(id)),
	);

	return (
		<main>
			<h1>Yleiskatsaus</h1>

			<h3>Viimeksi katsotut projektit</h3>
			<For each={lastVisited()}>
				{(project) => (
					<A href={`projects/${project()?.id}`}>
						<div>{project()?.name}</div>
					</A>
				)}
			</For>

			<h3>Seuraavat tehtävät</h3>
			<For each={tasksSorted}>
				{(task) => (
					<A href={`projects/${task.project}/tasks/${task.id}`}>
						<div>
							{task.name} | {formatDate(new Date(task.end as Date))}
						</div>
					</A>
				)}
			</For>
		</main>
	);
};
