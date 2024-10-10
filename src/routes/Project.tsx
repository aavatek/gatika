import { useNavigate, useParams } from '@solidjs/router';
import { Button } from '$components/form/Button';
import { Show } from 'solid-js';
import { projects } from '$features/project/@.store';
import { ProjectList } from '$features/project/ProjectList';
import { TaskList } from '$features/task/TaskList';
import { CreateTaskForm } from '$features/task/TaskForm';
import {
	CreateProjectForm,
	EditProjectForm,
} from '$features/project/ProjectForm';

export const ProjectListView = () => {
	return (
		<main>
			<h1>Projektit</h1>
			<CreateProjectForm />
			<ProjectList />
		</main>
	);
};

export const ProjectView = () => {
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
		<Show when={project()} fallback={<NotFoundView />}>
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

export const ProjectEditView = () => {
	const params = useParams();
	const project = projects.read(params.projectId);

	return (
		<Show when={project()} fallback={<NotFoundView />}>
			{(project) => (
				<main>
					<h1>Projekti: {project().name}</h1>
					<EditProjectForm project={project} />
				</main>
			)}
		</Show>
	);
};

const NotFoundView = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<main>
			<h1>Projektia ei löytynyt</h1>
			<Button label="Takaisin" onclick={handleBack} />
		</main>
	);
};
