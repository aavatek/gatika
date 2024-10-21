import { makePersisted, storageSync } from '@solid-primitives/storage';
import {
	children,
	createMemo,
	splitProps,
	type JSX,
	type Accessor,
	For,
} from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { A, useNavigate } from '@solidjs/router';
import * as v from 'valibot';
import * as mf from '@modular-forms/solid';
import * as sx from '@stylexjs/stylex';
import { Button, InputField, SelectField } from '@components/Form';
import { Heading } from '@components/Layout';

export const [resourceStore, setResourceStore] = makePersisted(
	createStore<Resource[]>([]),
	{
		name: 'resources',
		storage: localStorage,
		sync: storageSync,
	},
);

export const resources = {
	create: (resource: Resource) =>
		setResourceStore(produce((store) => store.push(resource))),

	read: (id: Resource['id']) =>
		createMemo(() => resourceStore.find((resource) => resource.id === id)),

	update: (id: Resource['id'], data: Partial<Resource>) => {
		setResourceStore(
			(resource) => resource.id === id,
			produce((resource) => Object.assign(resource, data)),
		);
	},

	delete: (id: Resource['id']) => {
		setResourceStore((store) => store.filter((resource) => resource.id !== id));
	},

	list: () => resourceStore,
};

const resourceTypes = ['Equipment', 'Personnel', 'Material'] as const;

export const ResourceSchema = v.pipe(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		type: v.picklist(resourceTypes),
		available: v.optional(
			v.array(
				v.object({
					start: v.number(),
					end: v.number(),
				}),
			),
		),
	}),

	v.transform((input) => ({
		...input,
		id: crypto.randomUUID(),
	})),
);

export const ResourceEditSchema = v.object({
	...ResourceSchema.entries,
});

export type ResourceInput = v.InferInput<typeof ResourceSchema>;
export type Resource = v.InferOutput<typeof ResourceSchema>;
export const ResourceToInput = (resource: Resource) => {
	return splitProps(resource, ['id'])[1];
};

type ResourceFormProps = {
	form: ReturnType<typeof mf.createForm<ResourceInput>>;
	onCancel?: () => void;
	onSubmit: mf.SubmitHandler<ResourceInput>;
	children?: JSX.Element;
};

export const ResourceForm = (props: ResourceFormProps) => {
	const [_, { Form, Field }] = props.form;
	const Buttons = children(() => props.children);

	const typeOptions = resourceTypes.map((type) => ({
		value: type,
		label: type,
	}));

	return (
		<Form onSubmit={props.onSubmit} {...sx.props(style.form)}>
			<Field name="name">
				{(field, props) => (
					<InputField
						{...props}
						type="text"
						label="Resurssin nimi"
						value={field.value}
						error={field.error}
					/>
				)}
			</Field>

			<Field name="type">
				{(field, props) => (
					<SelectField
						{...props}
						label="Tyyppi"
						value={field.value}
						error={field.error}
						placeholder="Valitse tyyppi"
						options={typeOptions}
					/>
				)}
			</Field>

			{Buttons()}
		</Form>
	);
};

export const ResourceCreateForm = () => {
	const form = mf.createForm<ResourceInput>({
		validate: mf.valiForm(ResourceSchema),
	});

	const handleSubmit: mf.SubmitHandler<ResourceInput> = (data, _) => {
		const validate = v.safeParse(ResourceSchema, data);
		if (validate.success) {
			resources.create(validate.output);
			return mf.reset(form[0]);
		}
	};

	return (
		<section {...sx.props(style.formWrapper)}>
			<Heading content="Luo resurssi" level="h2" />
			<ResourceForm onSubmit={handleSubmit} form={form}>
				<Button variant="primary" type="submit" label="Luo" />
			</ResourceForm>
		</section>
	);
};

// -------------------------------------------------------------------------------------

type ResourceEditFormProps = {
	resource: Accessor<Resource>;
};

export const ResourceEditForm = (props: ResourceEditFormProps) => {
	const navigate = useNavigate();
	const form = mf.createForm<ResourceInput>({
		validate: mf.valiForm(ResourceSchema),
	});

	const handleSubmit: mf.SubmitHandler<ResourceInput> = (data, _) => {
		const validate = v.safeParse(ResourceEditSchema, data);
		if (validate.success) {
			return resources.update(props.resource().id, validate.output);
		}
	};

	const handleDelete = () => {
		resources.delete(props.resource().id);
		navigate('/resources', { replace: true });
	};

	const resource = ResourceToInput(props.resource());
	mf.setValues(form[0], {
		...resource,
	});

	return (
		<section>
			<ResourceForm onSubmit={handleSubmit} form={form}>
				<Button variant="primary" type="submit" label="Tallenna" />
				<Button
					variant="warning"
					type="button"
					label="Poista"
					onClick={handleDelete}
				/>
			</ResourceForm>
		</section>
	);
};

type ResourceListProps = {
	label: string;
};

export const ResourceList = (props: ResourceListProps) => {
	const listItem = createMemo(() => resources.list());

	return (
		<section {...sx.props(style.listWrapper)}>
			<Heading content={props.label} level="h2" />
			<ol {...sx.props(style.list)}>
				<For each={listItem()} fallback={<div>Ei resursseja</div>}>
					{(resource: Resource) => <ResourceListItem {...resource} />}
				</For>
			</ol>
		</section>
	);
};

const ResourceListItem = (props: Resource) => {
	return (
		<A {...sx.props(style.listItemLink)} href={`/resources/${props.id}`}>
			<li {...sx.props(style.listItem)}>
				<span>{props.name}</span>
			</li>
		</A>
	);
};

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
