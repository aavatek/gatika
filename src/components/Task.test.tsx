import { render, screen } from "@solidjs/testing-library";
import { userEvent } from "@vitest/browser/context";
import { describe, expect, it, vi } from "vitest";
import { CreateTaskForm } from "./Task";

vi.mock("uuid", () => ({
	v4: () => "mocked-uuid",
}));

describe("CreateTaskForm", () => {
	it("renders the form", () => {
		render(() => <CreateTaskForm />);

		const input = screen.getByLabelText("Name");
		expect(input).toBeInTheDocument();

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
	});

	it("displays error message when submitted with an empty name", async () => {
		render(() => <CreateTaskForm />);

		const button = screen.getByRole("button");
		userEvent.click(button);

		const errorMessage = await screen.findByText("Required");
		expect(errorMessage).toBeInTheDocument();
	});

	it("removes error message once valid input", async () => {
		render(() => <CreateTaskForm />);
		const input = screen.getByLabelText("Name");
		await userEvent.click(screen.getByRole("button"));

		const errorMessage = await screen.findByText("Required");
		expect(errorMessage).toBeInTheDocument();

		await userEvent.type(input, "New Task");
		expect(screen.queryByText("Required")).not.toBeInTheDocument();
	});

	it("logs task to console when submitted with a valid name", async () => {
		const consoleSpy = vi.spyOn(console, "log");
		render(() => <CreateTaskForm />);

		const input = screen.getByLabelText("Name");
		await userEvent.type(input, "New Task");

		const button = screen.getByRole("button");
		await userEvent.click(button);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "New Task",
				id: "mocked-uuid",
				created: expect.any(Date),
			}),
		);
	});

	it("resets the form after successful submission", async () => {
		render(() => <CreateTaskForm />);

		const input = screen.getByLabelText("Name");
		await userEvent.type(input, "New Task");
		expect(input).toHaveValue("New Task");

		await userEvent.click(screen.getByRole("button"));
		expect(input).toHaveValue(undefined);
	});
});
