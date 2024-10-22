import * as v from 'valibot';
import * as mf from '@modular-forms/solid';
import * as sx from '@stylexjs/stylex';
import type { Accessor, JSX } from 'solid-js';
import { For, children, createMemo, createSignal, splitProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { A, useNavigate } from '@solidjs/router';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { Button, InputField } from '@components/Form';
import { tasks } from '@features/Task';
import { Heading } from '../components/Layout';

// -------------------------------------------------------------------------------------

export const [projectStore, setProjectStore] = makePersisted(
	createStore<Project[]>([]),
	{
		name: 'projects',
		storage: localStorage,
		sync: storageSync,
	},
);

export const projects = {
	create: (project: Project) =>
		setProjectStore(produce((store) => store.push(project))),

	read: (id: Project['id']) =>
		createMemo(() => projectStore.find((project) => project.id === id)),

	update: (id: Project['id'], data: Partial<Project>) => {
		setProjectStore(
			(project) => project.id === id,
			produce((project) => Object.assign(project, data)),
		);
	},

	delete: (id: Project['id']) => {
		setProjectStore((store) => store.filter((project) => project.id !== id));
		setVisited((visited) => visited.filter((project) => project !== id));
		tasks.deleteByProject(id);
	},

	list: () => projectStore,
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
		<Form onSubmit={props.onSubmit} {...sx.props(style.form)}>
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
		<section {...sx.props(style.formWrapper)}>
			<Heading content="Luo projekti" level="h2" />
			<ProjectForm onSubmit={handleSubmit} form={form}>
				<Button variant="primary" type="submit" label="Luo" />
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

	const handleDelete = () => {
		projects.delete(props.project().id);
		navigate('/projects', { replace: true });
	};

	const project = ProjectToInput(props.project());
	mf.setValues(form[0], {
		...project,
	});

	return (
		<section>
			<ProjectForm onSubmit={handleSubmit} form={form}>
				<Button variant="primary" type="submit" label="Tallenna" />
				<Button
					variant="warning"
					type="button"
					label="Poista"
					onClick={handleDelete}
				/>
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
	const listItem = createMemo(() => {
		return props.filter === 'lastAccessed'
			? visited().map((id) => projects.read(id)())
			: projects.list();
	}) as () => Project[];

	return (
		<section {...sx.props(style.listWrapper)}>
			<Heading content={props.label} level="h2" />
			<ol {...sx.props(style.list)}>
				<For each={listItem()} fallback={<div>Ei viimeksi katsottuja</div>}>
					{(project: Project) => <ProjectListItem {...project} />}
				</For>
			</ol>
		</section>
	);
};

const ProjectListItem = (props: Project) => {
	return (
		<A {...sx.props(style.listItemLink)} href={`/projects/${props.id}`}>
			<li {...sx.props(style.listItem)}>
				<span>{props.name}</span>
			</li>
		</A>
	);
};

// -------------------------------------------------------------------------------------

const style = sx.create({
	listWrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
	},

	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: '.5rem',
	},

	listItem: {
		border: '2px solid black',
		padding: '1rem',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		background: {
			default: '#f0f0f0',
			':hover': '#ccc',
		},
	},

	listItemLink: {
		textDecoration: 'none',
		color: 'black',
	},

	formWrapper: {
		display: 'flex',
		gap: '1rem',
		flexDirection: 'column',
	},

	form: {
		display: 'flex',
		gap: '.5rem',
		flexDirection: 'column',
		border: '2px solid black',
		padding: '1rem',
	},
});
