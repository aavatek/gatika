import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { Button } from '@components/Form';
import { TaskList, CreateTaskForm } from '@features/Task';
import {
	CreateProjectForm,
	EditProjectForm,
	ProjectList,
	projects,
} from '@features/Project';

export const PListView = () => {
	return (
		<main>
			<h1>Projektit</h1>
			<CreateProjectForm />
			<ProjectList />
		</main>
	);
};

export const PView = () => {
	const params = useParams();
	const navigate = useNavigate();
	const project = projects.read(params.projectId);

	const handleBack = () => navigate(-1);
	const handleEdit = () => navigate(`/projects/${params.projectId}/edit`);
	const handleDelete = () => {
		projects.delete(params.id);
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
					<CreateTaskForm projectID={project().id} />
					<TaskList projectID={project().id} />
				</main>
			)}
		</Show>
	);
};

export const PEditView = () => {
	const params = useParams();
	const project = projects.read(params.projectId);

	return (
		<Show when={project()}>
			{(project) => (
				<main>
					<h1>Projekti: {project().name}</h1>
					<EditProjectForm project={project} />
				</main>
			)}
		</Show>
	);
};
