import { createSignal } from "solid-js";

export default function HelloWorld(props: { name: string }) {
	const [name, setName] = createSignal("Test");

	return (
		<div>
			<button type="button" onclick={() => setName(props.name)}>
				Hello {name()}!
			</button>
		</div>
	);
}
