/* @refresh reload */

import { MetaProvider, Title } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';

// global components
import Head from './components/Head';
import Layout from './components/Layout';

// routes
import { default as Dashboard } from './routes/Dashboard';
import { default as NotFound } from './routes/NotFound';
import { default as Unexpected } from './routes/Unexpected';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Head />
				<Suspense>
					<Router root={Layout}>
						<Route path="/" component={Dashboard} />
						<Route path="*" component={NotFound} />
					</Router>
				</Suspense>
			</MetaProvider>
		</ErrorBoundary>
	),

	// this is defined in project root index.html
	document.getElementById('app') as HTMLElement,
);
