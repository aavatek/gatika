import { createMemo, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { TaskList } from '@features/Task';
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

			<TaskList label="Seuraavat tehtävät" sort />
		</main>
	);
};
