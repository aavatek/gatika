import { useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import { H1, PageHeader, PageLayout } from '@components/Layout';
import { Link } from '@components/Nav';

export function TView() {
	const params = useParams();
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);

	return (
		<Show when={task()}>
			{(task) => (
				<PageLayout>
					<PageHeader>
						<H1 content={task().name} />
						<Link href={`/projects/${task().project}`} content="Takaisin" />
					</PageHeader>
					<TaskEditForm task={task} />
				</PageLayout>
			)}
		</Show>
	);
}
