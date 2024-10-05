import { useNavigate, useParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import { Button } from '$/components/form/Button';
import { TaskList } from '$/features/task/TaskList';
import { TaskForm } from '$/features/task/TaskCreateForm';
import { tasks } from '$/features/task/@.store';
import styles from './@.module.css';

export function View() {
	const params = useParams();
	const navigate = useNavigate();
	const task = tasks.read(params.id);

	const handleBack = () => navigate(-1);
	const handleEdit = () => navigate(`/tasks/${params.id}/edit`);
	const handleDelete = () => (tasks.delete(params.id), navigate(-1));

	return (
		<Show when={task()} fallback={<NotFoundView />}>
			{(task) => (
				<main class={styles.taskView}>
					<h1>Tehtävä: {task().name}</h1>
					<Button content="Takaisin" onclick={handleBack} />
					<Button content="Muokkaa" onclick={handleEdit} />
					<Button content="Poista" onclick={handleDelete} />
				</main>
			)}
		</Show>
	);
}

export function EditView() {
	const params = useParams();
	const task = tasks.read(params.id);
	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<Show when={task()} fallback={<NotFoundView />}>
			{(task) => (
				<main class={styles.taskEditView}>
					<h1>Tehtävä: {task().name} (muokkaus)</h1>
					<Button content="Takaisin" onClick={handleBack} />
				</main>
			)}
		</Show>
	);
}

export function ListView() {
	return (
		<main class={styles.taskListView}>
			<h1>Tehtävät</h1>
			<TaskList />
			<TaskForm />
		</main>
	);
}

const NotFoundView = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<main class={styles.taskNotFound}>
			<h1>Tehtävää ei löytynyt</h1>
			<Button content="Takaisin" onclick={handleBack} />
		</main>
	);
};
