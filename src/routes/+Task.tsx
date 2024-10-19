import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '@components/Form';
import { type Task, TaskEditForm, tasks } from '@features/Task';
import type { Project } from '@features/Project';
import { Main } from '@components/Layout';

export function TView() {
	const params = useParams();
	const navigate = useNavigate();
	const projectID = params.projectID as Project['id'];
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);

	const handleBack = () => navigate(-1);
	const handleEdit = () =>
		navigate(`/projects/${projectID}/tasks/${taskID}/edit`);
	const handleDelete = () => {
		tasks.delete(taskID);
		navigate(`/projects/${projectID}`, { replace: true });
	};

	return (
		<Show when={task()}>
			{(task) => (
				<Main>
					<h1>Tehtävä: {task().name}</h1>
					<Button label="Takaisin" onclick={handleBack} />
					<Button label="Muokkaa" onclick={handleEdit} />
					<Button label="Poista" onclick={handleDelete} />
				</Main>
			)}
		</Show>
	);
}

export function TEditView() {
	const params = useParams();
	const taskID = params.taskID as Task['id'];
	const task = tasks.read(taskID);

	return (
		<Show when={task()}>
			{(task) => (
				<Main>
					<h1>Tehtävä: {task().name}</h1>
					<TaskEditForm task={task} />
				</Main>
			)}
		</Show>
	);
}
