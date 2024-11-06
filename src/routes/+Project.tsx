import { useNavigate, useParams } from '@solidjs/router';
import { onMount, Show } from 'solid-js';
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
	Heading,
	PageContentSection,
	PageHeader,
	PageLayout,
} from '@components/Layout';
import { Link } from '@components/Nav';
import { Button } from '@components/Form';

export const PListView = () => {
	return (
		<PageLayout>
			<PageHeader>
				<Heading content="Projektit" level="h1" />
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

	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	onMount(() => {
		if (project()) {
			addToLastVisited(projectID);
		}
	});

	return (
		<PageLayout>
			<Show
				when={project()}
				fallback={
					<PageHeader>
						<Heading content="Projektia ei löytynyt" level="h1" />
						<Button label="Takaisin" variant="link" onClick={handleBack} />
					</PageHeader>
				}
			>
				{(project) => (
					<>
						<PageHeader>
							<Heading content={project().name} level="h1" />
							<Button label="Takaisin" variant="link" onClick={handleBack} />
							<Link
								href={`/projects/${project().id}/edit`}
								content="Hallitse"
							/>
						</PageHeader>

						<PageContentSection>
							<TaskList project={projectID} label="Kaikki tehtävät" />
							<TaskCreateForm project={projectID} />
						</PageContentSection>
					</>
				)}
			</Show>
		</PageLayout>
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
						<Heading content={project().name} level="h1" />
						<Link href={`/projects/${projectID}`} content="Takaisin" />
					</PageHeader>

					<ProjectEditForm project={project} />
				</PageLayout>
			)}
		</Show>
	);
};
