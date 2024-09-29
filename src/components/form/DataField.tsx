import { Button } from '$components/form/Button';
import { InputField } from '$components/form/InputField';
import type { Task } from '$components/task/Task.model';
import { type ComponentProps, createEffect, createMemo } from 'solid-js';
import { For, createSignal } from 'solid-js';

type ComboboxProps = {
	options: Task[];
	value?: string;
} & ComponentProps<'option'>;

export function Combobox(props: ComboboxProps) {
	const [input, setInput] = createSignal('');
	const [options, setOptions] = createSignal(props.options);
	const [filtered, setFiltered] = createSignal([] as typeof props.options);
	const [selected, setSelected] = createSignal([] as typeof props.options);

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setInput(target.value);
	};

	const handleSelect = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			const target = filtered()[0];

			if (target && input().length > 0 && filtered().length === 1) {
				setInput(String());
			}

			if (target && !selected().includes(target)) {
				setSelected(() => [...selected(), target]);
				setOptions(() => options().filter((option) => option !== target));
			}
		}
	};

	createEffect(() => {
		if (input().length === 0) return setFiltered([]);

		const selection = options().filter((option) =>
			option.name.toLowerCase().includes(input().toLowerCase()),
		);

		setFiltered(selection);
	});

	const getListId = createMemo(() => {
		return `datalist-${crypto.randomUUID()}`;
	});

	const removeSelected = (e: Event) => {
		const target = e.target as HTMLDivElement;
		const targetSelection = target.parentNode?.firstChild?.textContent;
		const targetOption = selected().find(
			(select) => select.name === targetSelection,
		);

		if (targetOption) {
			setSelected(() => selected().filter((option) => option !== targetOption));
			setOptions(() => [...options(), targetOption]);
		}
	};

	return (
		<div id="test">
			<datalist id={getListId()}>
				<For each={options()}>
					{(option) => <option id={option.id} value={option.name} />}
				</For>
			</datalist>

			<InputField
				autocomplete="off"
				label="Dependencies"
				placeholder="Combobox"
				list={getListId()}
				onInput={handleInput}
				onKeyDown={handleSelect}
				value={input()}
			/>

			<For each={selected()}>
				{(option) => (
					<div>
						{option.name} <Button content="x" onClick={removeSelected} />
					</div>
				)}
			</For>
		</div>
	);
}
