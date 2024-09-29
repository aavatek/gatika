/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';

// global styles
import './app.css';

// global components
import Head from '$components/layout/Head';
import Layout from '$components/layout/Layout';

// routes
import { default as Dashboard } from '$routes/Dashboard';
import { default as NotFound } from '$routes/NotFound';
import { TaskEditView, TaskListView, TaskView } from '$routes/TaskView';
import { default as Unexpected } from '$routes/Unexpected';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Head />
				<Suspense>
					<Router root={Layout}>
						<Route path="*" component={NotFound} />
						<Route path="/" component={Dashboard} />
						<Route path="/tasks" component={TaskListView} />
						<Route path="/tasks/:id" component={TaskView} />
						<Route path="/tasks/:id/edit" component={TaskEditView} />
					</Router>
				</Suspense>
			</MetaProvider>
		</ErrorBoundary>
	),

	// this is defined in project root index.html
	document.getElementById('app') as HTMLElement,
);
