import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '@components/Form';
import { EditTaskForm, tasks } from '@features/Task';

export function TView() {
	const params = useParams();
	const navigate = useNavigate();
	const task = tasks.read(params.taskId);

	const handleBack = () => navigate(-1);
	const handleEdit = () => navigate(`/tasks/${params.taskId}/edit`);
	const handleDelete = () => {
		tasks.delete(params.taskId);
		navigate(-1);
	};

	return (
		<Show when={task()}>
			{(task) => (
				<main>
					<h1>Tehtävä: {task().name}</h1>
					<Button label="Takaisin" onclick={handleBack} />
					<Button label="Muokkaa" onclick={handleEdit} />
					<Button label="Poista" onclick={handleDelete} />
				</main>
			)}
		</Show>
	);
}

export function TEditView() {
	const params = useParams();
	const task = tasks.read(params.taskId);

	return (
		<Show when={task()}>
			{(task) => (
				<main>
					<h1>Tehtävä: {task().name}</h1>
					<EditTaskForm task={task} />
				</main>
			)}
		</Show>
	);
}
