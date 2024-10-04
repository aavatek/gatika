import { FieldError } from './FieldError';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { describe, expect, it } from 'vitest';

const errorMessage = 'Error is present';

describe('FieldError', () => {
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
