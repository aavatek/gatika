import { createEffect, createSignal } from 'solid-js';
import { SelectField } from '../components/Form';
import { projects } from '../features/Project';

export const Gantt = () => {
	const [selected, setSelected] = createSignal('');
	const projectSelectOptions = projects.list().map((p) => ({
		label: p.name,
		value: p.id,
	}));

	createEffect(() => {
		console.log(selected());
	});

	return (
		<main>
			<h1>Gantt</h1>
			<SelectField
				placeholder="Kaikki"
				options={projectSelectOptions}
				value={selected()}
				onChange={(e) => setSelected(e.target.value)}
			/>
		</main>
	);
};
