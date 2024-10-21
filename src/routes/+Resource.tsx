import {
	Heading,
	PageContentSection,
	PageHeader,
	PageLayout,
} from '@components/Layout';
import { useParams } from '@solidjs/router';
import {
	type Resource,
	ResourceCreateForm,
	ResourceEditForm,
	ResourceList,
	resources,
} from '@features/Resource';
import { Show } from 'solid-js';
import { Link } from '@components/Nav';

export const RListView = () => {
	return (
		<PageLayout>
			<PageHeader>
				<Heading content="Resurssit" level="h1" />
			</PageHeader>
			<PageContentSection>
				<ResourceList label="Kaikki resurssit" />
				<ResourceCreateForm />
			</PageContentSection>
		</PageLayout>
	);
};

export const RView = () => {
	const params = useParams();
	const resourceID = params.resourceID as Resource['id'];
	const resource = resources.read(resourceID);

	return (
		<Show when={resource()}>
			{(resource) => (
				<PageLayout>
					<PageHeader>
						<Heading content={resource().name} level="h1" />
						<Link href="/resources" content="Takaisin" />
					</PageHeader>

					<ResourceEditForm resource={resource} />
				</PageLayout>
			)}
		</Show>
	);
};
