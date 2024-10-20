import { A, useParams } from '@solidjs/router';
import { createMemo, onMount, Show } from 'solid-js';
import { TaskList, TaskCreateForm } from '@features/Task';
import {
	projects,
	addToLastVisited,
	type Project,
	ProjectCreateForm,
	ProjectEditForm,
	ProjectList,
} from '@features/Project';
import { Main } from '@components/Layout';
import * as sx from '@stylexjs/stylex';

export const PListView = () => {
	return (
		<Main>
			<header {...sx.props(style.header)}>
				<h1 {...sx.props(style.h1)}>Projektit</h1>
			</header>
			<section {...sx.props(style.contentSection)}>
				<ProjectList label="Kaikki projektit" />
				<ProjectCreateForm />
			</section>
		</Main>
	);
};

export const PView = () => {
	const params = useParams();
	const projectID = params.projectID as Project['id'];
	const project = projects.read(projectID);
	const previousPath = createMemo(() => {
		const state = history.state as { prev?: string } | null;
		return state?.prev || '/projects';
	});

	onMount(() => {
		addToLastVisited(projectID);
	});

	return (
		<Show when={project()}>
			{(project) => (
				<Main>
					<header {...sx.props(style.header)}>
						<h1 {...sx.props(style.h1)}>{project().name}</h1>
						<A
							href={previousPath()}
							textContent="Takaisin"
							{...sx.props(style.link)}
						/>
						<A
							href={`/projects/${project().id}/edit`}
							textContent="Hallitse"
							{...sx.props(style.link)}
						/>
					</header>

					<div {...sx.props(style.contentSection)}>
						<TaskList project={projectID} label="Kaikki tehtävät" />
						<TaskCreateForm project={projectID} />
					</div>
				</Main>
			)}
		</Show>
	);
};

export const PEditView = () => {
	const params = useParams();
	const projectID = params.projectID as Project['id'];
	const project = projects.read(projectID);

	return (
		<Show when={project()}>
			{(project) => (
				<Main>
					<header {...sx.props(style.header)}>
						<h1 {...sx.props(style.h1)}>{project().name}</h1>
						<A
							href={`/projects/${projectID}`}
							textContent="Takaisin"
							{...sx.props(style.link)}
						/>
					</header>

					<ProjectEditForm project={project} />
				</Main>
			)}
		</Show>
	);
};

const style = sx.create({
	header: {
		display: 'flex',
		alignItems: 'end',
		gap: '1rem',
		marginBottom: '1rem',
	},

	link: {
		color: 'inherit',
		fontSize: '1.25rem',
	},

	contentSection: {
		display: 'grid',
		gap: '2rem',
		gridTemplateColumns: {
			default: '1fr 1fr',
			'@media (max-width: 800px)': '1fr',
		},
	},

	h1: {
		fontSize: '2rem',
		lineHeight: '1.5rem',
	},
});
