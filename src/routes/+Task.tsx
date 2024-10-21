import { useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import { Heading, PageHeader, PageLayout } from '@components/Layout';
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
						<Heading content={task().name} level="h1" />
						<Link href={`/projects/${task().project}`} content="Takaisin" />
					</PageHeader>
					<TaskEditForm task={task} />
				</PageLayout>
			)}
		</Show>
	);
}
