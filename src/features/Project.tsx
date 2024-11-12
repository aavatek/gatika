import * as v from 'valibot';
import * as mf from '@modular-forms/solid';
import * as sx from '@stylexjs/stylex';
import type { Accessor, JSX } from 'solid-js';
import { For, children, createMemo, createSignal, splitProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { useNavigate } from '@solidjs/router';
import { makePersisted, storageSync } from '@solid-primitives/storage';
import { Button, InputField } from '@components/Form';
import { tasks } from '@features/Task';
import { Heading } from '@components/Layout';
import { List, ListItem } from '@features/List';
import { notificationMsg, setNotification } from './Notification';

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

export enum ProjectColors {
	SkyBlue = 'lch(82% 35 250)', // Clearer blue, more vibrant but still professional
	SoftSage = 'lch(84% 32 145)', // Crisper sage green
	WarmSand = 'lch(85% 38 80)', // Warmer, richer sand tone
	Lavender = 'lch(83% 34 300)', // More distinct lavender
	MossGreen = 'lch(84% 33 170)', // Fresher moss green
	Peach = 'lch(85% 36 55)', // More defined peach
	Slate = 'lch(82% 32 225)', // Richer slate blue
	Rose = 'lch(84% 35 15)', // More pronounced rose
	Mint = 'lch(85% 33 135)', // Clearer mint
	Mauve = 'lch(83% 34 330)', // More defined mauve
	Ochre = 'lch(84% 37 95)', // Richer ochre
	Teal = 'lch(83% 34 190)', // More vibrant teal
	Coral = 'lch(84% 36 35)', // More defined coral
}
export type ColorKey = keyof typeof ProjectColors;

const colorUsed = (color: ColorKey): boolean =>
	projects.list().some((project: Project) => project.color === color);

export const getColor = (): ColorKey => {
	const allColors = Object.keys(ProjectColors) as ColorKey[];
	const available = allColors.filter((color) => !colorUsed(color));
	return available.length ? available[0] : 'SkyBlue';
};

const err = {
	name: {
		invalid: 'Anna projektille nimi',
		empty: 'Anna projektille nimi',
		tooLong: 'Projektin nimen tulee olla enintään 255 merkkiä',
	},
};

export const ProjectSchema = v.pipe(
	v.object({
		name: v.pipe(
			v.string(err.name.empty),
			v.nonEmpty(err.name.empty),
			v.maxLength(255, err.name.tooLong),
		),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
		color: getColor(),
		created: Date.now(),
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
			setNotification({
				variant: 'success',
				message: notificationMsg.projectCreated,
			});
			return mf.reset(form[0]);
		}

		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
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
			setNotification({
				variant: 'success',
				message: notificationMsg.projectEdited,
			});

			return projects.update(props.project().id, validate.output);
		}

		setNotification({
			variant: 'error',
			message: notificationMsg.unexpectedError,
		});
	};

	const handleDelete = () => {
		projects.delete(props.project().id);
		setNotification({
			variant: 'success',
			message: notificationMsg.projectDeleted,
		});

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
		<List label={props.label}>
			<For each={listItem()} fallback={<div>Ei viimeksi katsottuja</div>}>
				{(project: Project) => (
					<ListItem
						href={`/projects/${project.id}`}
						name={project.name}
						extraStyles={style.listItem}
					/>
				)}
			</For>
		</List>
	);
};

// -------------------------------------------------------------------------------------

const style = sx.create({
	listItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
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
