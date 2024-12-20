import { createSignal } from 'solid-js';
import { formatDate } from '@solid-primitives/date';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { default as userEvent } from '@testing-library/user-event';
import {
	Button,
	InputField,
	FieldError,
	FieldLabel,
	SelectField,
} from './Form';

// -------------------------------------------------------------------------------------

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

		setProps({ error: 'This field has error' });
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-errormessage');

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

// -------------------------------------------------------------------------------------

describe('Button', () => {
	it('should render a button', () => {
		const { getByRole } = render(() => (
			<Button variant="primary" label="Do something" />
		));

		const button = getByRole('button');
		expect(button.textContent).toBe('Do something');
	});

	it('calls onClick handler when clicked', async () => {
		const handleClick = vi.fn();
		const { getByRole } = render(() => (
			<Button variant="primary" onClick={handleClick} label="Do something" />
		));

		const button = getByRole('button');
		await userEvent.click(button);

		expect(handleClick).toHaveBeenCalled();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('applies standard HTML button attributes', () => {
		const name = 'button-name';

		const { getByRole } = render(() => (
			<Button
				variant="primary"
				name={name}
				type="submit"
				label="Do something"
				aria-label="Submit do something"
			/>
		));

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
				<Button variant="primary" type={type} label="Do something" />
			));
			const button = getByRole('button');
			expect(button).toHaveAttribute('type', type);
		}
	});
});

// -------------------------------------------------------------------------------------

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

// -------------------------------------------------------------------------------------

describe('FieldLabel', () => {
	it('displays correct text', () => {
		const { getByText } = render(() => (
			<FieldLabel id="Test" label="Test label" />
		));

		const fieldLabel = getByText('Test label');
		expect(fieldLabel.textContent).toEqual('Test label');
	});
});

// -------------------------------------------------------------------------------------

describe('SelectField', () => {
	it('renders the select element with a label', () => {
		const { getByLabelText } = render(() => (
			<SelectField
				label="Choices"
				options={[
					{ value: 'One', label: 'First' },
					{ value: 'Two', label: 'Second' },
					{ value: 'Three', label: 'third' },
				]}
			/>
		));

		const selectElement = getByLabelText('Choices');
		expect(selectElement).toBeDefined();
	});

	it('renders the all options', () => {
		const { container } = render(() => (
			<SelectField
				label="Choices"
				options={[
					{ value: 'One', label: 'First' },
					{ value: 'Two', label: 'Second' },
					{ value: 'Three', label: 'Third' },
				]}
			/>
		));

		expect(
			container.querySelector('option[label="First"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('option[label="Second"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('option[label="Third"]'),
		).toBeInTheDocument();
	});

	it('selects the correct option', () => {
		const { getByLabelText } = render(() => (
			<SelectField
				label="Choices"
				options={[
					{ value: 'One', label: 'First' },
					{ value: 'Two', label: 'Second' },
					{ value: 'Three', label: 'third' },
				]}
				value="Two"
			/>
		));

		const selectElement = getByLabelText('Choices') as HTMLSelectElement;
		expect(selectElement.value).toBe('Two');
	});
});

// -------------------------------------------------------------------------------------
