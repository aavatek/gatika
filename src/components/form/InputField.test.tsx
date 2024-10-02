import { render } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InputField } from './InputField';

describe('InputField', () => {
	it('should render an input field with different types', () => {
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

	it('should be focusable', () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" />
		));

		const input = getByLabelText('Task name');
		input.focus();

		expect(document.activeElement).toBe(input);
	});

	it('should match what the user is typing', async () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" />
		));
		const input = getByLabelText('Task name') as HTMLInputElement;
		await userEvent.type(input, 'Tärkeä tehtävä');

		expect(input).toHaveValue('Tärkeä tehtävä');
	});

	it('should activate aria-invalid and aria-errormessage if input is empty', () => {
		const { getByLabelText } = render(() => (
			<InputField
				type="text"
				name="name"
				label="Task name"
				value=""
				error="This field is required"
			/>
		));
		const input = getByLabelText('Task name') as HTMLInputElement;

		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-errormessage');
	});

	it('should convert date into correct format', () => {
		const { getByLabelText } = render(() => (
			<InputField
				type="date"
				name="start date"
				label="Start date"
				value={new Date('2021-09-01')}
			/>
		));
		const input = getByLabelText('Start date') as HTMLInputElement;
		const convertedDate = new Date('2021-09-01').toISOString().split('T')[0];

		expect(input.value).toBe(convertedDate);
	});

	it('should convert number to string', () => {
		const { getByLabelText } = render(() => (
			<InputField type="number" name="number" label="Number" value={5} />
		));
		const input = getByLabelText('Number') as HTMLInputElement;
		expect(input.value).toBe('5');
	});

	it('should have disabled attributes, when disabled', () => {
		const { getByLabelText } = render(() => (
			<InputField
				type="text"
				name="name"
				label="Task name"
				value=""
				disabled
				aria-disabled="true"
			/>
		));

		const input = getByLabelText('Task name');

		expect(input).toHaveAttribute('disabled');
		expect(input).toHaveAttribute('aria-disabled', 'true');
	});

	it('should prevent users from typing, if input is disabled', () => {
		const { getByLabelText } = render(() => (
			<InputField type="text" name="name" label="Task name" value="" disabled />
		));

		const input = getByLabelText('Task name');

		expect(input).not.toHaveFocus();
	});
});
