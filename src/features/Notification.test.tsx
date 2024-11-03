import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@solidjs/testing-library';
import { Notification, setNotification, notificationMsg } from './Notification';

// Mock style properties
vi.mock('@stylexjs/stylex', () => ({
	props: vi.fn(() => ({})),
	create: vi.fn((styles) => styles),
}));

describe('Notification component', () => {
	beforeEach(() => {
		// used only in the last test
		vi.useFakeTimers();
		setNotification(undefined);
	});

	it('renders success notification with message', async () => {
		setNotification({
			variant: 'success',
			message: notificationMsg.taskCreated,
		});
		render(() => <Notification />);

		await waitFor(() => {
			expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();
		});
	});

	it('renders warning notification with message', async () => {
		setNotification({
			variant: 'warning',
			message: notificationMsg.projectCreated,
		});

		render(() => <Notification />);

		await waitFor(() => {
			expect(
				screen.getByText(notificationMsg.projectCreated),
			).toBeInTheDocument();
		});
	}, 15000);

	it('renders error notification with message', async () => {
		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});

		render(() => <Notification />);

		await waitFor(() => {
			expect(
				screen.getByText(notificationMsg.unexpectedError),
			).toBeInTheDocument();
		});
	}, 15000);

	it('hides error notification after 3 seconds', async () => {
		setNotification({
			variant: 'error',
			message: notificationMsg.taskCreated,
		});

		render(() => <Notification />);

		await waitFor(() => {
			expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();
		});

		// Advance the timer by 3000 milliseconds
		vi.advanceTimersByTime(3000);

		// Assert that the notification is no longer in the document
		expect(screen.queryByText(notificationMsg.taskCreated)).toBeNull();
	}, 10000);
});
