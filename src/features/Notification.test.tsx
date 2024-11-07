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
		setNotification(undefined);
	});

	it('renders success notification with message', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'success',
			message: notificationMsg.taskCreated,
		});

		await waitFor(() =>
			expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument(),
		);
	});

	it('renders warning notification with message', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'warning',
			message: notificationMsg.projectCreated,
		});
		await waitFor(() =>
			expect(
				screen.getByText(notificationMsg.projectCreated),
			).toBeInTheDocument(),
		);
	});

	it('renders error notification with message', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
		await waitFor(() =>
			expect(
				screen.getByText(notificationMsg.unexpectedError),
			).toBeInTheDocument(),
		);
	});

	it('hides notification after 3 seconds', async () => {
		render(() => <Notification />);
		vi.useFakeTimers();
		setNotification({
			variant: 'error',
			message: notificationMsg.taskCreated,
		});
		// Verify notification is initially in the document
		expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();

		// Advance the timer 3s
		vi.advanceTimersByTime(3000);
		await waitFor(() =>
			expect(screen.queryByText(notificationMsg.taskCreated)).toBeNull(),
		);
	});
});
