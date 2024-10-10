import type { Project } from './@.schema';
import { For } from 'solid-js';
import { Link } from '$components/core/Nav';
import { projects } from './@.store';
import styles from './@.module.css';

export const ProjectList = () => {
	return (
		<section class={styles.projectListWrapper}>
			<h2>Kaikki projektit</h2>
			<ol class={styles.projectList}>
				<For each={projects.list()} fallback={<p>Ei projekteja</p>}>
					{(project: Project) => <ProjectListItem {...project} />}
				</For>
			</ol>
		</section>
	);
};

const ProjectListItem = (props: Project) => {
	return (
		<li class={styles.projectListItem}>
			<span>{props.name}</span>
			<Link href={`/projects/${props.id}`} label="Näytä" />
		</li>
	);
};
