import { type Accessor, children, type JSX } from 'solid-js';
import * as mf from '@modular-forms/solid';
import * as v from 'valibot';
import {
	type Project,
	type ProjectInput,
	ProjectSchema,
	ProjectEditSchema,
	ProjectToInput,
} from './@.schema';
import { InputField } from '$components/form/Input';
import { Button } from '$components/form/Button';
import { projects } from './@.store';
import { useNavigate } from '@solidjs/router';

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
