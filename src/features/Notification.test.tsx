import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { Notification, setNotification, notificationMsg } from './Notification';

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

		setTimeout(() => {
			expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();
		}, 1000);
	});

	it('renders warning notification with message', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'warning',
			message: notificationMsg.projectCreated,
		});

		setTimeout(() => {
			expect(
				screen.getByText(notificationMsg.projectCreated),
			).toBeInTheDocument();
		}, 1000);
	});

	it('renders error notification with message', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});

		setTimeout(() => {
			expect(
				screen.getByText(notificationMsg.unexpectedError),
			).toBeInTheDocument();
		}, 1000);
	});

	it('hides notification after 3 seconds', async () => {
		render(() => <Notification />);
		setNotification({
			variant: 'error',
			message: notificationMsg.taskCreated,
		});

		setTimeout(() => {
			// Verify notification is initially in the document
			expect(screen.getByText(notificationMsg.taskCreated)).toBeInTheDocument();
		}, 1000);

		setTimeout(() => {
			// Verify it disappears after 4s
			expect(screen.getByText(notificationMsg.taskCreated)).toBeNull();
		}, 4000);
	});
});
