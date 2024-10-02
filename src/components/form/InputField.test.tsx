import { render } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InputField } from './InputField';
import { createSignal } from 'solid-js';

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
				value={new Date('2021-09-01')}
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
