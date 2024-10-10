/* @refresh reload */

import { MetaProvider } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { ErrorBoundary, Suspense, render } from 'solid-js/web';
import { Layout } from '@components/Layout';
import { NotFound, Unexpected } from '@root/src/routes/+Error';
import { Dashboard } from '@routes/+Index';
import { PListView, PView, PEditView } from '@routes/+Project';
import { TView, TEditView } from '@routes/+Task';

// styles
import 'virtual:uno.css';

render(
	() => (
		<ErrorBoundary fallback={Unexpected}>
			<MetaProvider>
				<Suspense>
					<Router root={Layout}>
						<Route path="/" component={Dashboard} />
						<Route path="*" component={NotFound} />
						<Route path="/projects">
							<Route path="/" component={PListView} />
							<Route path="/:projectID">
								<Route path="/" component={PView} />
								<Route path="/edit" component={PEditView} />
								<Route path="/tasks/:taskID" component={TView} />
								<Route path="/tasks/:taskID/edit" component={TEditView} />
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
