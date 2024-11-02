/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';
import { Layout } from '@components/Layout';
import { NotFound, Unexpected } from '@root/src/routes/+Error';
import { Dashboard } from '@routes/+Index';
import { PListView, PView, PEditView } from '@routes/+Project';
import { TView } from '@routes/+Task';
import { Page } from '@routes/+Gantt';

// styles
import 'virtual:uno.css';
import '@unocss/reset/eric-meyer.css';
import { WEEK } from '@lib/dates';
import { setProjectStore, setVisited, type Project } from '@features/Project';
import { setTaskStore, tasks, type Task } from './features/Task';

const populate = () => {
	if (!tasks.list().find((task) => task.name === 'Tehtävä C3')) {
		setProjectStore(() => []);
		setVisited(() => []);
		setTaskStore(() => []);

		const mockProjects: Project[] = [
			{
				id: crypto.randomUUID(),
				name: 'Projekti A',
			},
			{
				id: crypto.randomUUID(),
				name: 'Projekti B',
			},
			{
				id: crypto.randomUUID(),
				name: 'Projekti C',
			},
		];

		const mockTasksForA: Task[] = [
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä A1',
				start: Date.now() - WEEK,
				end: Date.now(),
				project: mockProjects[0].id,
				dependencies: [],
			},
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä A2',
				start: Date.now(),
				end: Date.now() + WEEK,
				project: mockProjects[0].id,
				dependencies: [],
			},
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä A3',
				start: Date.now() + WEEK,
				end: Date.now() + WEEK * 2,
				project: mockProjects[0].id,
				dependencies: [],
			},
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä A3',
				start: Date.now() - WEEK * 3,
				end: Date.now() + WEEK,
				project: mockProjects[0].id,
				dependencies: [],
			},
		];

		const mockTasksForC: Task[] = [
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä C1',
				start: Number.NaN,
				end: Number.NaN,
				project: mockProjects[2].id,
				dependencies: [],
			},
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä C2',
				start: Number.NaN,
				end: Number.NaN,
				project: mockProjects[2].id,
				dependencies: [],
			},
			{
				id: crypto.randomUUID(),
				name: 'Tehtävä C3',
				start: Number.NaN,
				end: Number.NaN,
				project: mockProjects[2].id,
				dependencies: [],
			},
		];

		setProjectStore(mockProjects);
		setTaskStore([...mockTasksForA, ...mockTasksForC]);
	}
};

populate();

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Suspense>
					<Router root={Layout}>
						<Route path="*" component={NotFound} />
						<Route path="/" component={Dashboard} />
						<Route path="/gantt" component={Page} />
						<Route path="/projects">
							<Route path="/" component={PListView} />
							<Route path="/:projectID">
								<Route path="/" component={PView} />
								<Route path="/edit" component={PEditView} />
								<Route path="/tasks/:taskID" component={TView} />
							</Route>
						</Route>
					</Router>
				</Suspense>
			</MetaProvider>
		</ErrorBoundary>
	),

	// this is defined in project root index.html
	document.getElementById('app') as HTMLElement,
);
