import { render, screen } from '@solidjs/testing-library';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { CreateTaskForm } from './Task';

vi.mock('uuid', () => ({
	v4: () => 'mocked-uuid',
}));

describe('CreateTaskForm', () => {
	it('renders the form', () => {
		render(() => <CreateTaskForm />);

		const nameInput = screen.getByRole('textbox', { name: 'Name' });
		expect(nameInput).toBeInTheDocument();

		const startDateInput = screen.getByLabelText('Start Date');
		expect(startDateInput).toBeInTheDocument();

		const plannedEndDateInput = screen.getByLabelText('Planned End Date');
		expect(plannedEndDateInput).toBeInTheDocument();

		const button = screen.getByRole('button', { name: 'Create' });
		expect(button).toBeInTheDocument();
	});

	it('displays error message when submitted with an empty name', async () => {
		render(() => <CreateTaskForm />);

		const button = screen.getByRole('button');
		await userEvent.click(button);

		const errorMessage = await screen.findByText('Required');
		expect(errorMessage).toBeInTheDocument();
	});

	it('removes error message once valid input is provided', async () => {
		render(() => <CreateTaskForm />);
		const input = screen.getByLabelText('Name');
		await userEvent.click(screen.getByRole('button'));

		const errorMessage = await screen.findByText('Required');
		expect(errorMessage).toBeInTheDocument();

		await userEvent.type(input, 'New Task');
		expect(screen.queryByText('Required')).not.toBeInTheDocument();
	});

	it('logs task to console when submitted with valid inputs', async () => {
		const consoleSpy = vi.spyOn(console, 'log');
		render(() => <CreateTaskForm />);

		const nameInput = screen.getByLabelText('Name');
		await userEvent.type(nameInput, 'New Task');

		const startDateInput = screen.getByLabelText('Start Date');
		await userEvent.type(startDateInput, '2023-07-01');

		const plannedEndDateInput = screen.getByLabelText('Planned End Date');
		await userEvent.type(plannedEndDateInput, '2023-07-31');

		const button = screen.getByRole('button');
		await userEvent.click(button);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'New Task',
				id: 'mocked-uuid',
				created: expect.any(Date),
				startDate: expect.any(Date),
				plannedEndDate: expect.any(Date),
			}),
		);
	});

	it('resets the form after successful submission', async () => {
		render(() => <CreateTaskForm />);

		const nameInput = screen.getByLabelText('Name');
		const startDateInput = screen.getByLabelText('Start Date');
		const plannedEndDateInput = screen.getByLabelText('Planned End Date');

		await userEvent.type(nameInput, 'New Task');
		await userEvent.type(startDateInput, '07/01/2023');
		await userEvent.type(plannedEndDateInput, '07/31/2023');
		await userEvent.click(screen.getByRole('button'));

		expect(nameInput).toHaveValue('');
		expect(startDateInput).toHaveValue('');
		expect(plannedEndDateInput).toHaveValue('');
	});
});
