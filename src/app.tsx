/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';

// global styles
import 'virtual:uno.css';
import './app.css';

// global components
import Head from '$components/core/Meta';
import Layout from '$components/core/Layout';

// routes
import { Page as NotFound } from '$routes/[404]';
import { Page as Unexpected } from '$routes/[500]';
import { Page as Dashboard } from '$routes/Dashboard';
import { ProjectListView, ProjectView, ProjectEditView } from '$routes/Project';
import { TaskView, TaskEditView } from '$routes/Task';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Head />
				<Suspense>
					<Router root={Layout}>
						<Route path="/" component={Dashboard} />
						<Route path="*" component={NotFound} />
						<Route path="/projects">
							<Route path="/" component={ProjectListView} />
							<Route path="/:id" component={ProjectView} />
							<Route path="/:id/edit" component={ProjectEditView} />
						</Route>
						<Route path="/tasks">
							<Route path="/:id" component={TaskView} />
							<Route path="/:id/edit" component={TaskEditView} />
						</Route>
					</Router>
				</Suspense>
			</MetaProvider>
		</ErrorBoundary>
	),

	// this is defined in project root index.html
	document.getElementById('app') as HTMLElement,
);
