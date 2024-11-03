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

	it('renders success notification with message', () => {
		setNotification({
			variant: 'success',
			message: notificationMsg.taskCreated,
		});
		render(() => <Notification />);

		expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();
	});

	it('renders warning notification with message', () => {
		setNotification({
			variant: 'warning',
			message: notificationMsg.projectCreated,
		});
		render(() => <Notification />);

		expect(
			screen.getByText(notificationMsg.projectCreated),
		).toBeInTheDocument();
	});

	it('renders error notification with message', () => {
		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
		render(() => <Notification />);

		expect(
			screen.getByText(notificationMsg.unexpectedError),
		).toBeInTheDocument();
	});

	it('hides notification after 3 seconds', async () => {
		setNotification({
			variant: 'error',
			message: notificationMsg.taskCreated,
		});

		render(() => <Notification />);

		// Verify notification is initially in the document
		expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();

		// Advance the timer 3s
		vi.advanceTimersByTime(3000);

		await waitFor(() =>
			expect(screen.queryByText(notificationMsg.taskCreated)).toBeNull(),
		);
	});
});
