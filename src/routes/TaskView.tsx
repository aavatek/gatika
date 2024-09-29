import { Button } from '$components/form/Button';
import { TaskForm, TaskList } from '$components/task/Task';
import { tasks } from '$lib/api';
import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';

export function TaskView() {
	const params = useParams();
	const navigate = useNavigate();
	const task = tasks.read(params.id);
	const handleBack = () => navigate(-1);
	const handleEdit = () => navigate(`/tasks/${params.id}/edit`);
	const handleDelete = () => (tasks.delete(params.id), navigate(-1));

	return (
		<Show when={task()} fallback={<TaskNotFound />}>
			{(task) => (
				<main>
					<h1>Tehtävä: {task().name}</h1>
					<Button content="Takaisin" onclick={handleBack} />
					<Button content="Muokkaa" onclick={handleEdit} />
					<Button content="Poista" onclick={handleDelete} />
				</main>
			)}
		</Show>
	);
}

export function TaskListView() {
	return (
		<main>
			<h1>Tehtävät</h1>
			<TaskForm />
			<TaskList />
		</main>
	);
}

export function TaskEditView() {
	const params = useParams();
	const navigate = useNavigate();
	const task = tasks.read(params.id);
	const handleBack = () => navigate(-1);

	return (
		<Show when={task()} fallback={<TaskNotFound />}>
			{(task) => (
				<main>
					<h1>Tehtävän muokkaus: {task().name}</h1>
					<Button content="Peruuta" onclick={handleBack} />
				</main>
			)}
		</Show>
	);
}

const TaskNotFound = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<main>
			<h1>Tehtävää ei löytynyt</h1>
			<Button content="Takaisin" onclick={handleBack} />
		</main>
	);
};
