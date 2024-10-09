import type { Task } from './@.schema';
import { For } from 'solid-js';
import { Link } from '$components/core/Nav';
import { tasks } from './@.store';
import styles from './@.module.css';

export const TaskList = () => {
	return (
		<section class={styles.taskListWrapper}>
			<h2>Kaikki tehtävät</h2>
			<ol class={styles.taskList}>
				<For each={tasks.list()} fallback={<p>Ei tehtäviä</p>}>
					{(task: Task) => <TaskListItem {...task} />}
				</For>
			</ol>
		</section>
	);
};

const TaskListItem = (props: Task) => {
	return (
		<li class={styles.taskListItem}>
			<span>{props.name}</span>
			<Link href={`/tasks/${props.id}`} label="Näytä" />
		</li>
	);
};
