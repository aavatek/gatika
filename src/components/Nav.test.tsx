import { describe, it, expect, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Nav, Link } from './Nav';
import type { AnchorProps } from '@solidjs/router';

// -------------------------------------------------------------------------------------

vi.mock('@solidjs/router', () => ({
	A: (props: AnchorProps) => <a href={props.href}>{props.children}</a>,
}));

describe('Nav Component', () => {
	it('renders nothing when there are no items', () => {
		const { queryByRole } = render(() => <Nav items={[]} />);
		expect(queryByRole('navigation')).toBeNull();
	});

	it('renders a list of links when there are multiple items', () => {
		const items: AnchorProps[] = [
			// create 2 links: "Home" & "Tasks"
			{ href: '/home', children: 'Home' },
			{ href: '/tasks', children: 'Tasks' },
		];

		const { getByRole, getAllByRole, getByText } = render(() => (
			<Nav items={items} />
		));

		expect(getByText('Home')).toBeInTheDocument();
		expect(getByText('Tasks')).toBeInTheDocument();
		expect(getByRole('list')).toBeInTheDocument();
		expect(getAllByRole('listitem')).toHaveLength(2);
	});
});

describe('Link', () => {
	it('renders the link with provided content and props', () => {
		const { getByRole } = render(() => (
			<Link content="Projects" href="/projects" />
		));
		expect(getByRole('link')).toBeInTheDocument();
		expect(getByRole('link')).toHaveAttribute('href', '/projects');
		expect(getByRole('link').textContent).toBe('Projects');
	});
});
