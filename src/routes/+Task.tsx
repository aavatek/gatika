import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import { Heading, PageHeader, PageLayout } from '@components/Layout';
import { Button } from '@components/Form';

export function TView() {
	const params = useParams();
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);

	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<Show when={task()}>
			{(task) => (
				<PageLayout>
					<PageHeader>
						<Heading content={task().name} level="h1" />
						<Button label="Takaisin" variant="link" onClick={handleBack} />
					</PageHeader>
					<TaskEditForm task={task} handleBack={handleBack} />
				</PageLayout>
			)}
		</Show>
	);
}
