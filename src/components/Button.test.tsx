import { getByLabelText, render, screen } from '@solidjs/testing-library';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

// target: developer
describe('Button', () => {
	it('should render a button', () => {
		const { getByRole } = render(() => <Button content="Do something" />);

		const button = getByRole('button');
		expect(button.textContent).toBe('Do something');
	});

	it('calls onClick handler when cli cked', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(() => (
			<Button onClick={handleClick} content="Do something" />
		));

		const button = getByRole('button');
		await userEvent.click(button);

		// check that the onClick handler was called
		expect(handleClick).toHaveBeenCalled();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('applies standard HTML button attributes', () => {
		const name = 'button-name';

		const { getByRole } = render(() => (
			<Button
				class="button"
				name={name}
				type="submit"
				content="Do something"
				aria-label="Submit do something"
			/>
		));

		// check if the button has the correct attributes
		const buttonElement = getByRole('button');
		expect(buttonElement).toHaveClass('button');
		expect(buttonElement).toHaveAttribute('name', name);
		expect(buttonElement).toHaveAttribute('type', 'submit');
		expect(buttonElement).toHaveAttribute('aria-label', 'Submit do something');
	});
});

// target: end user
describe('Button from user perspective', () => {
	it('should be focusable and trigger onClick with keyboard', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(() => (
			<Button onClick={handleClick} content="Do something" />
		));

		await userEvent.tab();
		await userEvent.keyboard('{enter}');

		// check that the onClick handler was called
		expect(handleClick).toHaveBeenCalled();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
