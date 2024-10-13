import { describe, expect, it, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Layout } from './Layout';
import { MetaProvider } from '@solidjs/meta';

vi.mock('./Nav', () => ({
	Nav: () => (
		<nav>
			<ul>
				<li>Mock nav component</li>
			</ul>
		</nav>
	),
}));

describe('Layout component', () => {
	it('renders children passed to it', () => {
		const { getByText } = render(() => (
			<MetaProvider>
				<Layout>
					<div>Layout test</div>
				</Layout>
			</MetaProvider>
		));
		expect(getByText('Layout test')).toBeInTheDocument();
	});

	it('renders Header', () => {
		const { container } = render(() => (
			<MetaProvider>
				<Layout />
			</MetaProvider>
		));
		expect(container.querySelector('header')).toBeInTheDocument();
	});

	it('renders meta tags', () => {
		render(() => (
			<MetaProvider>
				<Layout />
			</MetaProvider>
		));
		expect(document.querySelector('meta=[name="author"]')).toBeInTheDocument();
		expect(
			document.querySelector('meta[name="description"]'),
		).toBeInTheDocument();
	});
});
