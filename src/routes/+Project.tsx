import { useNavigate, useParams } from '@solidjs/router';
import { onMount, Show } from 'solid-js';
import { Button } from '@components/Form';
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

export const PListView = () => {
	return (
		<Main>
			<h1>Projektit</h1>
			<ProjectCreateForm />
			<ProjectList label="Kaikki projektit" />
		</Main>
	);
};

export const PView = () => {
	const params = useParams();
	const navigate = useNavigate();
	const projectID = params.projectID as Project['id'];
	const project = projects.read(projectID);

	const handleBack = () => navigate(-1);
	const handleEdit = () => navigate(`/projects/${projectID}/edit`);
	const handleDelete = () => {
		projects.delete(projectID);
		navigate('/projects', { replace: true });
	};

	onMount(() => {
		addToLastVisited(projectID);
	});

	return (
		<Show when={project()}>
			{(project) => (
				<Main>
					<h1>Projekti: {project().name}</h1>

					<Button label="Takaisin" onclick={handleBack} />
					<Button label="Muokkaa" onclick={handleEdit} />
					<Button label="Poista" onclick={handleDelete} />

					<TaskCreateForm project={projectID} />
					<TaskList project={projectID} label="Kaikki tehtävät" />
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
					<h1>Projekti: {project().name}</h1>
					<ProjectEditForm project={project} />
				</Main>
			)}
		</Show>
	);
};
