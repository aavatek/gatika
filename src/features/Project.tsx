import * as v from 'valibot';
import * as mf from '@modular-forms/solid';
import { type Accessor, type JSX, For, children, createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { A, useNavigate } from '@solidjs/router';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { Button, InputField } from '@components/Form';
import { TaskSchema } from '@features/Task';

// -------------------------------------------------------------------------------------

const [store, setStore] = makePersisted(createStore<Project[]>([]), {
	name: 'projects',
	storage: localStorage,
	sync: storageSync,
});

export const projects = {
	create: (project: Project) => {
		setStore(
			produce((store) => {
				store.push(project);
			}),
		);
	},

	read: (id: string) =>
		createMemo(() => store.find((project) => project.id === id)),

	update: (id: string, data: Partial<Project>) => {
		setStore(
			(project) => project.id === id,
			produce((project) => Object.assign(project, data)),
		);
	},

	delete: (id: string) => {
		setStore((store) => store.filter((project) => project.id !== id));
	},

	list: () => store,
};

// -------------------------------------------------------------------------------------

export const ProjectSchema = v.pipe(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		tasks: v.optional(v.array(TaskSchema)),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		created: new Date(),
	})),
);

export const ProjectEditSchema = v.pipe(
	v.object({
		...ProjectSchema.entries,
	}),

	v.transform((input) => ({
		...input,
		updated: new Date(),
	})),
);

export type ProjectInput = v.InferInput<typeof ProjectSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;

export const ProjectToInput = (project: Project) => {
	const { id, created, tasks, ...input } = project;
	return { ...input };
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

export const CreateProjectForm = () => {
	const form = mf.createForm<ProjectInput>({
		validate: mf.valiForm(ProjectSchema),
	});

	const handleSubmit: mf.SubmitHandler<ProjectInput> = (data, _) => {
		const validate = v.safeParse(ProjectSchema, data);
		if (validate.success) {
			projects.create(validate.output);
			return mf.reset(form[0]);
		}

		console.error(validate.issues);
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

type EditProjectFormProps = {
	project: Accessor<Project>;
};

export const EditProjectForm = (props: EditProjectFormProps) => {
	const navigate = useNavigate();
	const form = mf.createForm<ProjectInput>({
		validate: mf.valiForm(ProjectSchema),
	});

	const handleSubmit: mf.SubmitHandler<ProjectInput> = (data, _) => {
		const validate = v.safeParse(ProjectEditSchema, data);
		if (validate.success) {
			return projects.update(props.project().id, validate.output);
		}

		console.error(validate.issues);
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

export const ProjectList = () => {
	return (
		<section>
			<h2>Kaikki projektit</h2>
			<ol>
				<For each={projects.list()}>
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
