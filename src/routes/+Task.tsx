import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '@components/Form';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import { Main } from '@components/Layout';

export function TView() {
	const params = useParams();
	const navigate = useNavigate();
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);
	const handleBack = () => navigate(-1);

	return (
		<Show when={task()}>
			{(task) => (
				<Main>
					<header>
						<h1>Tehtävä: {task().name}</h1>
						<Button label="Takaisin" onclick={handleBack} />
					</header>
					<TaskEditForm task={task} />
				</Main>
			)}
		</Show>
	);
}
