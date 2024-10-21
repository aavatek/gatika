import { useParams } from '@solidjs/router';
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
import {
	H1,
	PageContentSection,
	PageHeader,
	PageLayout,
} from '@components/Layout';
import { Link } from '@components/Nav';

export const PListView = () => {
	return (
		<PageLayout>
			<PageHeader>
				<H1 content="Projektit" />
			</PageHeader>
			<PageContentSection>
				<ProjectList label="Kaikki projektit" />
				<ProjectCreateForm />
			</PageContentSection>
		</PageLayout>
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
				<PageLayout>
					<PageHeader>
						<H1 content={project().name} />
						<Link href={previousPath()} content="Takaisin" />
						<Link href={`/projects/${project().id}/edit`} content="Hallitse" />
					</PageHeader>

					<PageContentSection>
						<TaskList project={projectID} label="Kaikki tehtävät" />
						<TaskCreateForm project={projectID} />
					</PageContentSection>
				</PageLayout>
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
				<PageLayout>
					<PageHeader>
						<H1 content={project().name} />
						<Link href={`/projects/${projectID}`} content="Takaisin" />
					</PageHeader>

					<ProjectEditForm project={project} />
				</PageLayout>
			)}
		</Show>
	);
};
