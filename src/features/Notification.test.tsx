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
		render(() => <Notification />);
		setNotification({
			variant: 'success',
			message: notificationMsg.taskCreated,
		});
		screen.debug();

		expect(
			await screen.findByText(notificationMsg.taskCreated),
		).toBeInTheDocument();
	});

	it('renders warning notification with message', () => {
		render(() => <Notification />);
		setNotification({
			variant: 'warning',
			message: notificationMsg.projectCreated,
		});
		// test with debugs to see what causes the error
		screen.debug();
		expect(
			screen.getByText(notificationMsg.projectCreated),
		).toBeInTheDocument();
	});

	it('renders error notification with message', () => {
		render(() => <Notification />);
		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
		screen.debug();
		expect(
			screen.getByText(notificationMsg.unexpectedError),
		).toBeInTheDocument();
	});

	it('hides notification after 3 seconds', async () => {
		render(() => <Notification />);

		setNotification({
			variant: 'error',
			message: notificationMsg.taskCreated,
		});
		screen.debug();
		// Verify notification is initially in the document
		expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();

		// Advance the timer 3s
		vi.advanceTimersByTime(3000);
		await waitFor(() =>
			expect(screen.queryByText(notificationMsg.taskCreated)).toBeNull(),
		);
		screen.debug();
	});
});
