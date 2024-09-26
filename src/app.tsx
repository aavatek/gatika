import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import NavBar from './components/NavBar';

// global reset + styles
import './app.css';

export default function App() {
	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Title>Gatika</Title>
					<NavBar />
					<Suspense>{props.children}</Suspense>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
