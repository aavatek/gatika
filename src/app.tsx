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

// populate stores for demoing
import { populate } from '@lib/populate';
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
