import type { Project } from './@.schema';
import { For } from 'solid-js';
import { Link } from '$components/core/Nav';
import { projects } from './@.store';

export const ProjectList = () => {
	return (
		<section>
			<h2>Kaikki projektit</h2>
			<ol>
				<For each={projects.list()} fallback={<p>Ei projekteja</p>}>
					{(project: Project) => <ProjectListItem {...project} />}
				</For>
			</ol>
		</section>
	);
};

const ProjectListItem = (props: Project) => {
	return (
		<li>
			<span>{props.name}</span>
			<Link href={`/projects/${props.id}`} label="Näytä" />
		</li>
	);
};
