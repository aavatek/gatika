import * as v from 'valibot';
import * as mf from '@modular-forms/solid';
import type { Accessor, JSX } from 'solid-js';
import { For, children, createMemo, createSignal, splitProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { A, useNavigate } from '@solidjs/router';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { Button, InputField } from '@components/Form';
import { tasks } from '@features/Task';

// -------------------------------------------------------------------------------------

const [store, setStore] = makePersisted(createStore<Project[]>([]), {
	name: 'projects',
	storage: localStorage,
	sync: storageSync,
});

export const projects = {
	create: (project: Project) =>
		setStore(produce((store) => store.push(project))),

	read: (id: Project['id']) =>
		createMemo(() => store.find((project) => project.id === id)),

	update: (id: Project['id'], data: Partial<Project>) => {
		setStore(
			(project) => project.id === id,
			produce((project) => Object.assign(project, data)),
		);
	},

	delete: (id: Project['id']) => {
		setStore((store) => store.filter((project) => project.id !== id));
		tasks.deleteByProject(id);
	},

	list: () => store,
};

export const [visited, setVisited] = makePersisted(
	createSignal<Project['id'][]>([]),
	{
		name: 'visitedProjects',
		storage: localStorage,
		sync: storageSync,
	},
);

export const addToLastVisited = (id: Project['id']) => {
	if (visited().find((curr) => curr === id)) {
		setVisited(visited().filter((curr) => id !== curr));
	}

	setVisited((prev) => [id, ...prev]);
};

// -------------------------------------------------------------------------------------

export const ProjectSchema = v.pipe(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
	})),
);

export const ProjectEditSchema = v.object({
	...ProjectSchema.entries,
});

export type ProjectInput = v.InferInput<typeof ProjectSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;
export const ProjectToInput = (project: Project) => {
	return splitProps(project, ['id'])[1];
};

// -------------------------------------------------------------------------------------

type ProjectFormProps = {
	form: ReturnType<typeof mf.createForm<ProjectInput>>;
	onCancel?: () => void;
	onSubmit: mf.SubmitHandler<ProjectInput>;
	children?: JSX.Element;
};

export const ProjectForm = (props: ProjectFormProps) => {
	const [_, { Form, Field }] = props.form;
	const Buttons = children(() => props.children);

	return (
		<Form onSubmit={props.onSubmit}>
			<Field name="name">
				{(field, props) => (
					<InputField
						{...props}
						type="text"
						label="Projektin nimi"
						value={field.value}
						error={field.error}
						required
					/>
				)}
			</Field>

			{Buttons()}
		</Form>
	);
};

// -------------------------------------------------------------------------------------

export const ProjectCreateForm = () => {
	const form = mf.createForm<ProjectInput>({
		validate: mf.valiForm(ProjectSchema),
	});

	const handleSubmit: mf.SubmitHandler<ProjectInput> = (data, _) => {
		const validate = v.safeParse(ProjectSchema, data);
		if (validate.success) {
			projects.create(validate.output);
			return mf.reset(form[0]);
		}
	};

	return (
		<section>
			<h2>Luo projekti</h2>
			<ProjectForm onSubmit={handleSubmit} form={form}>
				<Button type="submit" label="Luo" />
			</ProjectForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type ProjectEditFormProps = {
	project: Accessor<Project>;
};

export const ProjectEditForm = (props: ProjectEditFormProps) => {
	const navigate = useNavigate();
	const form = mf.createForm<ProjectInput>({
		validate: mf.valiForm(ProjectSchema),
	});

	const handleSubmit: mf.SubmitHandler<ProjectInput> = (data, _) => {
		const validate = v.safeParse(ProjectEditSchema, data);
		if (validate.success) {
			return projects.update(props.project().id, validate.output);
		}
	};

	const project = ProjectToInput(props.project());
	mf.setValues(form[0], {
		...project,
	});

	return (
		<section>
			<h2>Muokkaa tehtävää</h2>
			<ProjectForm onSubmit={handleSubmit} form={form}>
				<Button type="submit" label="Tallenna" />
				<Button label="Peruuta" onclick={() => navigate(-1)} />
			</ProjectForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type ProjectListProps = {
	label: string;
	filter?: 'lastAccessed';
};

export const ProjectList = (props: ProjectListProps) => {
	const projectList = createMemo(() => {
		return props.filter === 'lastAccessed'
			? visited().map((id) => projects.read(id)())
			: projects.list();
	}) as () => Project[];

	return (
		<section>
			<h2>{props.label}</h2>
			<ol>
				<For each={projectList()}>
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
			<A href={`/projects/${props.id}`} innerText="Näytä" />
		</li>
	);
};

// -------------------------------------------------------------------------------------
