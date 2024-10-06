import { render } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputField } from './Input';
import { Button } from './Button';
import { createSignal } from 'solid-js';
import { formatDate } from '@solid-primitives/date';
import { FieldError } from './Field';

describe('InputField', () => {
	it('renders an input field with different types', () => {
		const types: Array<'text' | 'number' | 'Date'> = ['text', 'number', 'Date'];

		for (const type of types) {
			const { getByLabelText } = render(() => (
				<InputField type={type} name="name" label="Task name" value="" />
			));

			const inputField = getByLabelText('Task name');
			expect(inputField).toBeDefined();
			expect(inputField).toHaveAttribute('type', type);
		}
	});

	it('is focusable', () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" />
		));

		const input = getByLabelText('Task name');
		input.focus();
		expect(document.activeElement).toBe(input);
	});

	it('matches what the user is typing', async () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" />
		));

		const input = getByLabelText('Task name') as HTMLInputElement;
		await userEvent.type(input, 'Tärkeä tehtävä');
		expect(input).toHaveValue('Tärkeä tehtävä');
	});

	it('has appropriate aria attributes', () => {
		const [props, setProps] = createSignal({});

		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" {...props()} />
		));
		const input = getByLabelText('Task name') as HTMLInputElement;

		// input has error
		setProps({ error: 'This field has error' });
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-errormessage');

		// input field is disabled
		setProps({ disabled: true, 'aria-disabled': 'true' });
		expect(input).toHaveAttribute('disabled');
		expect(input).toHaveAttribute('aria-disabled', 'true');
	});

	it('converts date into correct format', () => {
		const { getByLabelText } = render(() => (
			<InputField
				type="date"
				name="start date"
				label="Start date"
				value={formatDate(new Date('2021-09-01'))}
			/>
		));

		const input = getByLabelText('Start date') as HTMLInputElement;
		const convertedDate = new Date('2021-09-01').toISOString().split('T')[0];
		expect(input.value).toBe(convertedDate);
	});

	it('converts number to string', () => {
		const { getByLabelText } = render(() => (
			<InputField type="number" name="number" label="Number" value={5} />
		));

		const input = getByLabelText('Number') as HTMLInputElement;
		expect(input.value).toBe('5');
	});

	it('is not focusable when input is disabled', () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" disabled />
		));

		const input = getByLabelText('Task name');
		expect(input).not.toHaveFocus();
	});
});

// target: developer
describe('Button', () => {
	it('should render a button', () => {
		const { getByRole } = render(() => <Button label="Do something" />);

		const button = getByRole('button');
		expect(button.textContent).toBe('Do something');
	});

	it('calls onClick handler when clicked', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(() => (
			<Button onClick={handleClick} label="Do something" />
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
				name={name}
				type="submit"
				label="Do something"
				aria-label="Submit do something"
			/>
		));

		// check if the button has the correct attributes
		const button = getByRole('button');
		expect(button).toHaveAttribute('name', name);
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('aria-label', 'Submit do something');
	});

	it('should have the correct type', () => {
		const types: Array<'button' | 'submit' | 'reset'> = [
			'button',
			'submit',
			'reset',
		];

		for (const type of types) {
			const { getByRole } = render(() => (
				<Button type={type} label="Do something" />
			));
			const button = getByRole('button');
			expect(button).toHaveAttribute('type', type);
		}
	});
});

describe('FieldError', () => {
	const errorMessage = 'Error is present';

	it('renders an error message', () => {
		const { getByText } = render(() => <FieldError error={errorMessage} />);

		const fieldError = getByText(errorMessage);
		expect(fieldError.textContent).toBe(errorMessage);
	});

	it('has appropriate aria attribute', () => {
		const [props, setProps] = createSignal({});

		const { container } = render(() => (
			<FieldError {...props} aria-disabled="true" />
		));

		const fieldError = container.querySelector('output') as HTMLOutputElement;
		expect(fieldError).toHaveAttribute('aria-hidden', 'true');

		setProps({ error: errorMessage });
		expect(fieldError).not.toHaveAttribute('aria-hidden');
	});
});

describe('FieldLabel', () => {
	it('should render a field label', () => {
		// TODO: write tests
	});
});
