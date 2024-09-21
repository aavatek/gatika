import { cleanup, render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
	it('renders text input with label', () => {
		const label = 'Username';
		const name = 'username';

		const { getByLabelText, getByText } = render(() => (
			<TextInput label={label} name={name} />
		));

		// check if the input is in the document
		const inputElement = getByLabelText(label);
		expect(inputElement).toBeInTheDocument();
		expect(inputElement).toHaveAttribute('name', name);

		// check if the label is in the document
		const labelElement = getByText(label);
		expect(labelElement).toBeInTheDocument();
		expect(labelElement).toHaveAttribute('for', name);
	});

	it('displays a required field indicator when specified', () => {
		const label = 'Username';
		const name = 'username';

		const { getByText } = render(() => (
			<TextInput label={label} name={name} required={true} />
		));

		// check if the label is in the document
		const labelElement = getByText(label);
		expect(labelElement).toBeInTheDocument();

		// check if the required indicator is in the document
		const requiredIndicatorElement = getByText('*');
		expect(requiredIndicatorElement).toBeInTheDocument();
		expect(requiredIndicatorElement).toHaveAttribute('aria-hidden', 'true');
	});

	it('shows an error message for invalid input', () => {
		const label = 'Username';
		const name = 'username';
		const errorMessage = 'Invalid username';

		const { getByText, getByLabelText } = render(() => (
			<TextInput label={label} name={name} error={errorMessage} />
		));

		// check if the input is in the document
		const inputElement = getByLabelText(label);
		expect(inputElement).toBeInTheDocument();
		expect(inputElement).toHaveAttribute('aria-invalid', 'true');
		expect(inputElement).toHaveAttribute('aria-errormessage', `${name}-error`);

		// check if the error message is displayed
		const errorElement = getByText(errorMessage);
		expect(errorElement).toBeInTheDocument();
		expect(errorElement).toHaveAttribute('id', `${name}-error`);

		// render without error
		cleanup();
		render(() => <TextInput label={label} name={name} />);

		// check if the error message is not displayed
		const inputWithoutError = screen.getByLabelText(label);
		expect(inputWithoutError).not.toHaveAttribute('aria-invalid');
		expect(inputWithoutError).not.toHaveAttribute('aria-errormessage');
		expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
	});

	it('applies standard HTML input attributes', () => {
		const label = 'Email';
		const name = 'email';
		const placeholderText = 'Enter your email';

		const { getByLabelText } = render(() => (
			<TextInput
				label={label}
				name={name}
				placeholder={placeholderText}
				type="email"
				maxLength={50}
				disabled={true}
			/>
		));

		// check if the input has the correct attributes
		const inputElement = getByLabelText(label) as HTMLInputElement;
		expect(inputElement).toHaveAttribute('name', name);
		expect(inputElement).toHaveAttribute('placeholder', placeholderText);
		expect(inputElement).toHaveAttribute('type', 'email');
		expect(inputElement).toHaveAttribute('maxLength', '50');
		expect(inputElement).toBeDisabled();
	});

	it('applies custom CSS classes to the container', () => {
		const label = 'Username';
		const name = 'username';
		const customClass = 'custom-class';
		const { container } = render(() => (
			<TextInput label={label} name={name} class={customClass} />
		));

		// check if the container has the custom class
		const containerElement = container.firstChild as HTMLElement;
		expect(containerElement).toHaveClass(customClass);
	});

	it('creates accessible fields for screen readers', () => {
		const label = 'Password';
		const name = 'password';
		const errorMessage = 'Password is required';

		// render with error and required
		render(() => (
			<TextInput
				label={label}
				name={name}
				required={true}
				error={errorMessage}
			/>
		));

		// check if the input has the correct accessibility attributes
		let inputElement = screen.getByLabelText(`${label} *`) as HTMLInputElement;
		expect(inputElement).toHaveAttribute('aria-required', 'true');
		expect(inputElement).toHaveAttribute('aria-invalid', 'true');
		expect(inputElement).toHaveAttribute('aria-errormessage', `${name}-error`);

		// render without error and not required
		cleanup();
		render(() => <TextInput label={label} name={name} />);

		// check if the input has the correct accessibility attributes
		inputElement = screen.getByLabelText(label) as HTMLInputElement;
		expect(inputElement).not.toHaveAttribute('aria-required');
		expect(inputElement).not.toHaveAttribute('aria-invalid');
		expect(inputElement).not.toHaveAttribute('aria-errormessage');
	});

	it('correctly sets id attributes for input and error message', () => {
		const label = 'Email';
		const name = 'email';
		const errorMessage = 'Invalid email format';

		const { getByLabelText, getByText } = render(() => (
			<TextInput label={label} name={name} error={errorMessage} />
		));

		// check if the input has the correct id attribute
		const inputElement = getByLabelText(label) as HTMLInputElement;
		expect(inputElement).toHaveAttribute('id', name);

		// check if the error message has the correct id
		const errorElement = getByText(errorMessage);
		expect(errorElement).toHaveAttribute('id', `${name}-error`);
	});
});
