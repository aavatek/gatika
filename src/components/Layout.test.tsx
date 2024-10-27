import { describe, expect, it, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import {
	Layout,
	PageLayout,
	PageHeader,
	PageContentSection,
	Heading,
} from './Layout';
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

// -------------------------------------------------------------------------------------

describe('PageLayout', () => {
	it('renders the page layout', () => {
		const { getByRole } = render(() => (
			<PageLayout>
				<section>Page Layout</section>
			</PageLayout>
		));

		expect(getByRole('main')).toBeInTheDocument();
		expect(getByRole('main').textContent).toContain('Page Layout');
	});
});

// -------------------------------------------------------------------------------------

describe('PageHeader', () => {
	it('renders the header', () => {
		const { getByRole } = render(() => (
			<PageHeader>
				<h1>Header</h1>
			</PageHeader>
		));

		expect(getByRole('banner')).toBeInTheDocument();
		expect(getByRole('banner').textContent).toBe('Header');
	});
});

// -------------------------------------------------------------------------------------

describe('PageContentSection', () => {
	it('renders section with provided children', () => {
		const { getByText } = render(() => (
			<PageContentSection>
				<div>Section</div>
			</PageContentSection>
		));

		expect(getByText('Section')).toBeInTheDocument();
	});
});

// -------------------------------------------------------------------------------------

describe('Heading', () => {
	it('renders the heading', () => {
		const { getByRole } = render(() => (
			<Heading content="Heading" level="h1" />
		));

		expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
		expect(getByRole('heading', { level: 1 }).textContent).toBe('Heading');
	});
});
