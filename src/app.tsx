/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';

// global styles
import './app.css';

// global components
import Head from './components/core/Meta';
import RootLayout from './layout/Root';

// routes
import { default as Dashboard } from './routes/Dashboard';
import { default as NotFound } from './routes/[404]';
import { default as Unexpected } from './routes/[500]';
import { ListView, View, EditView } from './routes/Task';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Head />
				<Suspense>
					<Router root={RootLayout}>
						<Route path="/" component={Dashboard} />
						<Route path="*" component={NotFound} />
						<Route path="/tasks">
							<Route path="/" component={ListView} />
							<Route path="/:id" component={View} />
							<Route path="/:id/edit" component={EditView} />
						</Route>
					</Router>
				</Suspense>
			</MetaProvider>
		</ErrorBoundary>
	),

	// this is defined in project root index.html
	document.getElementById('app') as HTMLElement,
);
