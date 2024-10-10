import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '@components/Form';
import { TaskList, TaskCreateForm } from '@features/Task';
import {
	projects,
	type Project,
	ProjectCreateForm,
	ProjectEditForm,
	ProjectList,
} from '@features/Project';

export const PListView = () => {
	return (
		<main>
			<h1>Projektit</h1>
			<ProjectCreateForm />
			<ProjectList />
		</main>
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

	return (
		<Show when={project()}>
			{(project) => (
				<main>
					<h1>Projekti: {project().name}</h1>

					<Button label="Takaisin" onclick={handleBack} />
					<Button label="Muokkaa" onclick={handleEdit} />
					<Button label="Poista" onclick={handleDelete} />

					<TaskCreateForm project={projectID} />
					<TaskList project={projectID} />
				</main>
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
				<main>
					<h1>Projekti: {project().name}</h1>
					<ProjectEditForm project={project} />
				</main>
			)}
		</Show>
	);
};
