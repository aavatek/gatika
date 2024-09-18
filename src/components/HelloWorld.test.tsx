import { expect, test } from "vitest";
import { render } from "@solidjs/testing-library";
import HelloWorld from "./HelloWorld";
import { userEvent } from "@vitest/browser/context";

test("renders name", async () => {
	const { getByRole } = render(() => <HelloWorld name="Vitest" />);
	expect(getByRole("button").textContent).toBe("Hello Test!");
});

test("changes name on button click", async () => {
	const { getByRole } = render(() => <HelloWorld name="Vitest" />);
	expect(getByRole("button").textContent).toBe("Hello Test!");
	await userEvent.click(getByRole("button"));
	expect(getByRole("button").textContent).toBe("Hello Vitest!");
});
