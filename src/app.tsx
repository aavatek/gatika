/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';

// global styles
import './app.css';

// global components
import Head from './components/layout/Head';
import Layout from './components/layout/Layout';

// routes
import { default as Index } from './routes/Index';
import { default as NotFound } from './routes/NotFound';
import { default as Unexpected } from './routes/Unexpected';
import { ListView, View, EditView } from './routes/TaskView';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Head />
				<Suspense>
					<Router root={Layout}>
						<Route path="/" component={Index} />
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
