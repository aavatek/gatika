import { describe, it, expect, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Nav } from './Nav';
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
			// create 2 links: "Home" & "About"
			{ href: '/home', children: 'Home' },
			{ href: '/about', children: 'About' },
		];

		const { getByRole, getAllByRole, getByText } = render(() => (
			<Nav items={items} />
		));

		expect(getByText('Home')).toBeInTheDocument();
		expect(getByText('About')).toBeInTheDocument();
		expect(getByRole('list')).toBeInTheDocument();
		expect(getAllByRole('listitem')).toHaveLength(2);
	});
});
